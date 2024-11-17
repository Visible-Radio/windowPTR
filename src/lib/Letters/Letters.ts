import { rgb8Bit } from '../../utils/typeUtils/intRange';
import { PTR } from '../PTR';
import { AttributeMap, Text } from '../parse/parser';
import { Blinking, FirstDraw, Glitching, Hidden, Idle, States } from './states';

export class Letters {
  list: Letter[];
  ptr: PTR;
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
        initialState:
          this.ptr.characterResolution === 'all' ? 'FIRST_DRAW' : undefined,
      });
      prev = letter;
      this.ptr.nodeMetaMap.addLetter(layoutObject.node!, letter);

      return letter;
    });
  }

  addLetters(characterResolution?: 'single' | 'all') {
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
        initialState:
          characterResolution === 'single'
            ? undefined
            : characterResolution === 'all'
            ? 'FIRST_DRAW'
            : this.ptr.characterResolution === 'all'
            ? 'FIRST_DRAW'
            : undefined,
      });
      prev = letter;
      this.ptr.nodeMetaMap.addLetter(layoutObject.node!, letter);
      return letter;
    });

    const promises = newLetters.map((letter) => {
      this.list.push(letter);
      return new Promise<Letter>((res) => {
        const remove = letter.addListener('FIRST_DRAW_DONE', () => {
          remove();
          return res(letter);
        });
      });
    });
    return Promise.all(promises);
  }

  updateLayout() {
    /* 
    at this point, up in PTR, we should have created a new layout
    the gives us new layout objects
    but we want the same old letters - but their position needs to match that of the new layout objects

    so we go through the layout list up in PTR
    get the position
    and apply it to each letter. the lists are the same length and indexes correspond 1:1
    */

    this.ptr.layout.layoutList.forEach((layoutObject, i) => {
      const newPosition = { x: layoutObject.x, y: layoutObject.y };
      this.list[i].position = newPosition;
    });
  }

  update() {
    this.list.forEach((letter) => {
      letter.update();
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
  listeners: { FIRST_DRAW_DONE: Set<(letter: Letter) => void> };

  constructor({
    position,
    char,
    ptr,
    attributes,
    letterIndex,
    previousLetter,
    node,
    initialState,
  }: {
    ptr: PTR;
    position: { x: number; y: number };
    char: string;
    attributes: AttributeMap;
    letterIndex: number;
    previousLetter: Letter | null;
    node: Text;
    initialState?: keyof States;
  }) {
    this.ptr = ptr;
    this.previousLetter = previousLetter;
    this.letterIndex = letterIndex;
    this.position = position;
    this.char = char;
    this.charWidth = this.ptr.defs.charWidth;
    this.attributes = attributes;
    this.node = node;
    this.listeners = {
      FIRST_DRAW_DONE: new Set(),
    };
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
    this.currentState = initialState
      ? this.states[initialState]
      : this.previousLetter
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

  setState(state: keyof typeof this.states) {
    this.states[state].enter();
  }

  addListener(
    state: keyof typeof this.listeners,
    callback: (letter: Letter) => void
  ) {
    if (state in this.listeners) {
      if (!this.listeners[state]!.has(callback)) {
        this.listeners[state]?.add(callback);
        return () => this.listeners[state]?.delete(callback);
      }
    }
    return () => false;
  }

  update() {
    if (this.currentState instanceof FirstDraw && this.currentState.done) {
      this.setState('IDLE');
    } else if (
      this.previousLetter &&
      this.previousLetter.states.FIRST_DRAW.done &&
      !this.states.FIRST_DRAW.done
    ) {
      this.setState('FIRST_DRAW');
    } else if (this.currentState instanceof Idle && Math.random() > 0.9993) {
      this.setState('GLITCHING');
    } else if (
      this.currentState instanceof Glitching &&
      this.currentState.done
    ) {
      this.setState('IDLE');
    } else if (this.currentState instanceof Idle && this.attributes.blink) {
      /* letters that should blink with this letter */
      const blinkingLetters = this.ptr.nodeMetaMap.getAllLettersForTextNode(
        this.node
      );
      /* check if all are ready to blink */
      const readyForBlink = blinkingLetters?.every(
        (letter) => letter.states.FIRST_DRAW.done
      );
      if (readyForBlink) {
        blinkingLetters?.forEach((letter) => {
          letter.setState('BLINKING');
        });
      }
    }
  }

  getFrame(deltaTime: number): Pixel[] {
    return this.currentState.getFrame(deltaTime);
  }
}
