import { gridPositionFromIndex } from '../utils/gridPositionFromIndex';
import { rgb8Bit } from '../utils/typeUtils/intRange';
import { PTR } from './PTR';
import { applyOutline, determineOutline } from './draw/outlineChar';
import { AttributeMap } from './parse/parser';

export class Letters {
  list: Letter[];
  ptr: PTR;
  currentLetter: Letter;
  previousLetter: Letter | null = null;
  previousLetters: Letter[] = [];
  pauseUpdates: boolean;
  constructor(ptr: PTR) {
    this.ptr = ptr;
    this.list = ptr.layout.layoutList.map(
      (layoutObject, i) =>
        new Letter({
          ptr,
          position: { x: layoutObject.x, y: layoutObject.y },
          char: layoutObject.char,
          attributes: layoutObject?.attributes ?? {},
          letterIndex: i,
        })
    );
    this.currentLetter = this.list[0];
    this.pauseUpdates = false;
  }

  addLetters() {
    const lastLetterIndex = this.list.length - 1;
    const newLayoutObjects = this.ptr.layout.layoutList.slice(this.list.length);
    const newLetters = newLayoutObjects.map((layoutObject, i) => {
      return new Letter({
        ptr: this.ptr,
        position: {
          x: layoutObject.x,
          y: layoutObject.y,
        },
        char: layoutObject.char,
        attributes: layoutObject?.attributes ?? {},
        letterIndex: i + 1 + lastLetterIndex,
      });
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
    if (this.pauseUpdates || !this.currentLetter) return;
    this.previousLetters.forEach((letter) => letter.update(deltaTime));
    this.currentLetter.animations[0].enable();

    if (this.currentLetter.animations[0].done) {
      this.previousLetters.push(this.currentLetter);
      this.previousLetter = this.currentLetter;
      const nextLetter = this.list[this.currentLetter.letterIndex + 1];
      if (!nextLetter) {
        return;
      }
      this.currentLetter = nextLetter;
    } else {
      this.currentLetter.update(deltaTime);
    }
  }

  updateAll(deltaTime: number) {
    if (this.pauseUpdates) return;
    this.list.forEach((letter) => letter.update(deltaTime));
  }
}

type Pixel = { x: number; y: number; color: rgb8Bit };

export class Letter {
  ptr: PTR;
  position: { x: number; y: number };
  char: string;
  charWidth: number;
  def: number[];
  fps = 120;
  frameInterval = 1000 / this.fps; // how long should a frame last
  frameTimer = 0;
  frameCounter = 0;
  initialAnimationComplete = false;
  pixels: Pixel[] = [];
  animations: LetterAnimation[];
  animationIndex: number;
  currentAnimation: LetterAnimation;
  attributes: AttributeMap;
  letterIndex: number;

  constructor({
    position,
    char,
    ptr,
    attributes,
    letterIndex,
  }: {
    ptr: PTR;
    position: { x: number; y: number };
    char: string;
    attributes: AttributeMap;
    letterIndex: number;
  }) {
    this.ptr = ptr;
    this.letterIndex = letterIndex;
    this.position = position;
    this.char = char;
    this.charWidth = this.ptr.defs.charWidth;
    this.attributes = attributes;
    const baseDef = ptr.defs[
      char.toUpperCase() as keyof typeof ptr.defs
    ] as number[];
    this.def = this.attributes.highlight ? this.invertDef(baseDef) : baseDef;
    this.frameTimer = 0;
    this.animations = [new LetterAnimation(this, { isLoop: false })];
    this.animationIndex = 0;
    this.currentAnimation = this.animations[this.animationIndex];
  }

  invertDef(def: number[]) {
    const full: number[] = [];
    for (let i = 0; i < this.charWidth * this.charWidth; i++) {
      if (!def.includes(i)) full.push(i);
    }
    return full;
  }

  update(deltaTime: number) {
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      /* here we'd want to advance the frame counter if frames remain in the animation */
      /* else if the animation is supposed to loop, reset the frame counter to 0 */
      /* else if the animation is suposed to freeze at the end, leave the frame counter where it is */
      if (!this.currentAnimation.done) {
        this.frameCounter++;
      } else if (Math.random() > 0.9997) {
        this.frameCounter = this.currentAnimation.totalFrames - 2;
        this.currentAnimation.done = false;
      }
    } else {
      this.frameTimer += deltaTime;
    }
  }
  getFrame(): Pixel[] {
    return this.currentAnimation.getFrame(this.frameCounter);
  }
}

export class LetterAnimation {
  isLoop: boolean;
  letter: Letter;
  totalFrames: number;
  done: boolean;
  enabled: boolean;
  constructor(letter: Letter, options: { isLoop: boolean }) {
    this.isLoop = options.isLoop;
    this.letter = letter;
    this.totalFrames = this.letter.charWidth - 1;
    this.done = false;
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  getFrame(frameIndex: number): Pixel[] {
    if (!this.enabled) return [];

    const basePixels = this.applyTransform(
      frameIndex,
      this.letter.def,
      this.letter.attributes?.color ?? this.letter.ptr.dm.values.borderColor
    );

    const outlinePoints = applyOutline(
      [],
      this.letter.charWidth,
      determineOutline(
        this.letter.ptr.layout.layoutList,
        this.letter.letterIndex
      )
    );

    let outlinePixels: Pixel[] = [];
    if (this.letter.attributes.outline) {
      const outlineColor = Array.isArray(this.letter.attributes?.outline)
        ? this.letter.attributes.outline
        : this.letter.attributes?.color ??
          this.letter.ptr.dm.values.borderColor;
      outlinePixels = this.applyTransform(
        frameIndex,
        outlinePoints,
        outlineColor
      );
    }
    if (frameIndex >= this.totalFrames) {
      this.done = true;
    }
    return basePixels.concat(outlinePixels);
  }

  applyTransform(frameIndex: number, points: number[], color: rgb8Bit) {
    const newPoints = points.map((oneDimensionalPoint) => {
      const { x, y } = gridPositionFromIndex({
        index: oneDimensionalPoint,
        columns: frameIndex + 1,
      });

      const positionMod =
        Math.random() > 0.95 ? Math.random() * getSign() * 2 : 0;
      const mapped = frameIndex / this.totalFrames;

      return {
        x: x + this.letter.position.x + positionMod,
        y: y + this.letter.position.y,
        color: modColor(color, mapped * 2),
      };
    });
    return newPoints;
  }
}

export function getSign() {
  return Math.random() > 0.5 ? -1 : 1;
}

function modColor(color: rgb8Bit, factor: number) {
  const chromaticMod = Math.floor(Math.random() * 10 * factor) * getSign();

  return color.map((channel) => {
    const newChannel =
      (channel - chromaticMod) * factor - (Math.random() > 0.8 ? -50 : 0);
    return newChannel;
  }) as rgb8Bit;
}
