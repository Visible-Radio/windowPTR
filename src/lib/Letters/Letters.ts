import { rgb8Bit } from '../../utils/typeUtils/intRange';
import { PTR } from '../PTR';
import { AttributeMap, Text } from '../parse/parser';
import { Blinking, FirstDraw, Glitching, Hidden, Idle, States } from './states';

type NodeMapData = {
  letters: Letter[];
};

class NodeMeta {
  private map: WeakMap<Text, NodeMapData>;
  constructor() {
    this.map = new WeakMap();
  }
  addLetter(node: Text, letter: Letter) {
    if (this.map.has(node)) {
      const existing = this.map.get(node)!.letters;

      existing.push(letter);
    } else {
      this.map.set(node, { letters: [letter] });
    }
  }
  getAllLettersForTextNode(node: Text) {
    return this.map.get(node)?.letters;
  }
}

const nodeMeta = new NodeMeta();

export class Letters {
  list: Letter[];
  ptr: PTR;
  pauseUpdates: boolean;
  nodeMeta = nodeMeta;
  constructor(ptr: PTR) {
    this.ptr = ptr;
    let prev: null | Letter = null;
    this.list = ptr.layout.layoutList.map((layoutObject, i) => {
      const letter = new Letter({
        ptr,
        position: { x: layoutObject.x, y: layoutObject.y },
        char: layoutObject.char,
        attributes: layoutObject?.attributes ?? {},
        letterIndex: i,
        previousLetter: prev,
        node: layoutObject.node!,
      });
      prev = letter;
      this.nodeMeta.addLetter(layoutObject.node!, letter);

      return letter;
    });
    this.pauseUpdates = false;
  }

  addLetters() {
    const lastLetterIndex = this.list.length - 1;
    const newLayoutObjects = this.ptr.layout.layoutList.slice(this.list.length);
    let prev: null | Letter = null;
    const newLetters = newLayoutObjects.map((layoutObject, i) => {
      const letter = new Letter({
        ptr: this.ptr,
        position: {
          x: layoutObject.x,
          y: layoutObject.y,
        },
        char: layoutObject.char,
        attributes: layoutObject?.attributes ?? {},
        letterIndex: i + 1 + lastLetterIndex,
        previousLetter: prev,
        node: layoutObject.node!,
      });
      prev = letter;
      this.nodeMeta.addLetter(layoutObject.node!, letter);
      return letter;
    });
    newLetters.forEach((letter) => this.list.push(letter));
  }

  pause() {
    this.pauseUpdates = true;
  }

  unPause() {
    this.pauseUpdates = false;
  }

  updateLayout() {
    /* namely, when the window is resized and we need to reflow the text */
    this.ptr.layout.layoutList.forEach((layoutObject, i) => {
      const newPosition = { x: layoutObject.x, y: layoutObject.y };
      this.list[i].position = newPosition;
    });
  }

  update(deltaTime: number) {
    if (this.pauseUpdates) return;
    this.list.forEach((letter) => {
      letter.update(deltaTime);
    });
  }
}

export type Pixel = { x: number; y: number; color: rgb8Bit };

export class Letter {
  ptr: PTR;
  position: { x: number; y: number };
  char: string;
  charWidth: number;
  def: number[];
  pixels: Pixel[] = [];
  states: States;
  currentState: States[keyof States];
  previousLetter: Letter | null;
  attributes: AttributeMap;
  letterIndex: number;
  node: Text;

  constructor({
    position,
    char,
    ptr,
    attributes,
    letterIndex,
    previousLetter,
    node,
  }: {
    ptr: PTR;
    position: { x: number; y: number };
    char: string;
    attributes: AttributeMap;
    letterIndex: number;
    previousLetter: Letter | null;
    node: Text;
  }) {
    this.ptr = ptr;
    this.previousLetter = previousLetter;
    this.letterIndex = letterIndex;
    this.position = position;
    this.char = char;
    this.charWidth = this.ptr.defs.charWidth;
    this.attributes = attributes;
    this.node = node;
    const baseDef = ptr.defs[
      char.toUpperCase() as keyof typeof ptr.defs
    ] as number[];
    this.def = this.attributes.highlight ? this.invertDef(baseDef) : baseDef;
    this.states = {
      HIDDEN: new Hidden(this),
      FIRST_DRAW: new FirstDraw(this),
      IDLE: new Idle(this),
      GLITCHING: new Glitching(this),
      BLINKING: new Blinking(this),
    };
    this.currentState = this.previousLetter
      ? this.states.HIDDEN
      : this.states.FIRST_DRAW;
  }

  invertDef(def: number[]) {
    const full: number[] = [];
    for (let i = 0; i < this.charWidth * this.charWidth; i++) {
      if (!def.includes(i)) full.push(i);
    }
    return full;
  }

  update(deltaTime: number) {
    if (this.currentState instanceof FirstDraw && this.currentState.done) {
      this.currentState = this.states.IDLE;
    } else if (
      this.previousLetter &&
      this.previousLetter.states.FIRST_DRAW.done &&
      !this.states.FIRST_DRAW.done
    ) {
      this.currentState = this.states.FIRST_DRAW;
    } else if (this.currentState instanceof Idle && Math.random() > 0.9993) {
      this.states.GLITCHING.enter();
    } else if (
      this.currentState instanceof Glitching &&
      this.currentState.done
    ) {
      this.currentState = this.states.IDLE;
    } else if (this.currentState instanceof Idle && this.attributes.blink) {
      /* letters that should blink with this letter */
      const blinkingLetters = nodeMeta.getAllLettersForTextNode(this.node);
      /* check if all are ready to blink */
      const readyForBlink = blinkingLetters?.every(
        (letter) => letter.states.FIRST_DRAW.done
      );
      if (readyForBlink) {
        blinkingLetters?.forEach((letter) => {
          letter.states.BLINKING.enter();
        });
      }
    }
  }

  getFrame(deltaTime: number): Pixel[] {
    return this.currentState.getFrame(deltaTime);
  }
}
