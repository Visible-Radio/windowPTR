import { gridPositionFromIndex } from '../../utils/gridPositionFromIndex';
import { rgb8Bit } from '../../utils/typeUtils/intRange';
import { applyOutline, determineOutline } from '../draw/outlineChar';
import { Letter, Pixel } from './Letters';

export type States = {
  HIDDEN: Hidden;
  FIRST_DRAW: FirstDraw;
  IDLE: Idle;
  GLITCHING: Glitching;
  BLINKING: Blinking;
  HOVER: Hover;
};

export interface LetterState {
  getFrame: (deltaTime: number) => Pixel[];
}

class BaseLetterState {
  letter: Letter;
  color: rgb8Bit;
  outline1dPoints: number[];
  totalFrames: number;
  constructor(letter: Letter) {
    this.letter = letter;
    this.color =
      this.letter.attributes?.color ?? this.letter.ptr.dm.values.borderColor;
    this.outline1dPoints = this.getOutline1dPoints();
    this.totalFrames = this.letter.charWidth - 1;
  }

  getOutline1dPoints() {
    return applyOutline(
      [],
      this.letter.charWidth,
      determineOutline(
        this.letter.ptr.layout.layoutList,
        this.letter.letterIndex
      )
    );
  }

  exit() {
    return undefined;
  }

  /** Note that _this_ getFrame() method expects the target width for transforming points,
   * whereass the subclasses expect deltaTime */
  getFrame(targetWidth: number): Pixel[] {
    const basePixels = this.transformPoints(
      targetWidth,
      this.letter.def,
      this.color
    );

    let outlinePixels: Pixel[] = [];

    if (this.letter.attributes.outline) {
      const outlineColor = Array.isArray(this.letter.attributes?.outline)
        ? this.letter.attributes.outline
        : this.color;

      outlinePixels = this.transformPoints(
        targetWidth,
        this.outline1dPoints,
        outlineColor
      );
    }

    return basePixels.concat(outlinePixels);
  }

  transformPoints(targetWidth: number, points: number[], color: rgb8Bit) {
    const newPoints = points.map((oneDimensionalPoint) => {
      const { x, y } = gridPositionFromIndex({
        index: oneDimensionalPoint,
        columns: targetWidth + 1,
      });

      const positionMod =
        Math.random() > 0.95 ? Math.random() * getSign() * 2 : 0;
      const mapped = targetWidth / this.totalFrames;

      return {
        x: x + this.letter.position.x + positionMod,
        y: y + this.letter.position.y,
        color: modColor(color, mapped * 2),
      };
    });
    return newPoints;
  }
}

export class Hidden extends BaseLetterState implements LetterState {
  letter: Letter;
  constructor(letter: Letter) {
    super(letter);
    this.letter = letter;
  }

  enter() {
    this.letter.currentState = this.letter.states.HIDDEN;
  }

  /** Returns an empty pixel array */
  getFrame(): Pixel[] {
    return [];
  }
}

export class FirstDraw extends BaseLetterState implements LetterState {
  letter: Letter;
  frameTimer: number;
  frameCounter: number;
  fps = 60;
  frameInterval = 1000 / this.fps;
  done = false;
  totalFrames: number;
  constructor(letter: Letter) {
    super(letter);
    this.letter = letter;
    this.frameTimer = 0;
    this.totalFrames = this.letter.charWidth - 1;
    this.frameCounter =
      this.letter.char === ' ' && !this.letter.attributes.highlight
        ? this.totalFrames - 1
        : 0;
  }

  enter() {
    this.letter.currentState = this.letter.states.FIRST_DRAW;
  }

  getFrame(deltaTime: number): Pixel[] {
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (!this.done) {
        this.frameCounter += 1;
      }
    } else {
      this.frameTimer += deltaTime;
    }

    if (this.frameCounter >= this.totalFrames) {
      this.done = true;
      this.letter.listeners.FIRST_DRAW_DONE?.forEach((fn) => fn(this.letter));
    }

    return super.getFrame(this.frameCounter);
  }
}

export class Idle extends BaseLetterState implements LetterState {
  letter: Letter;
  totalFrames: number;

  constructor(letter: Letter) {
    super(letter);
    this.letter = letter;
    this.totalFrames = this.letter.charWidth - 1;
  }

  enter() {
    this.letter.currentState = this.letter.states.IDLE;
  }

  /** Returns the letter in it's 'defined' state according to the definition */
  getFrame(): Pixel[] {
    return super.getFrame(this.letter.charWidth - 1);
  }
}

export class Glitching extends BaseLetterState implements LetterState {
  letter: Letter;
  done: boolean;
  frameTimer: number;
  frameCounter: number;
  fps = 60;
  frameInterval = 1000 / this.fps;
  totalFrames: number;

  constructor(letter: Letter) {
    super(letter);
    this.letter = letter;
    this.done = false;
    this.frameTimer = 0;
    this.frameCounter = 0;
    this.totalFrames = 4;
  }

  enter() {
    this.reset();
    this.letter.currentState = this.letter.states.GLITCHING;
  }

  reset() {
    this.done = false;
    this.frameCounter = 0;
    this.frameTimer = 0;
    this.totalFrames = Math.floor(Math.random() * 10);
  }

  getFrame(deltaTime: number): Pixel[] {
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (!this.done) {
        this.frameCounter++;
      }
    } else {
      this.frameTimer += deltaTime;
    }

    if (this.frameCounter >= this.totalFrames) {
      this.done = true;
    }

    return super
      .getFrame(this.letter.charWidth - 1 - this.frameCounter)
      .map((px) => {
        const [r, g, b] = px.color;
        return {
          ...px,
          color: [b, g, r],
        };
      });
  }
}

export class Blinking extends BaseLetterState implements LetterState {
  letter: Letter;
  frameTimer: number;
  frameCounter: number;
  fps = 15;
  frameInterval = 1000 / this.fps;
  totalFrames: number;

  frameBrightnessModifiers = [0, 0, 0, 0.5, 2, 1, 0.5, 0];
  constructor(letter: Letter) {
    super(letter);
    this.letter = letter;
    this.frameTimer = 0;
    this.frameCounter = 0;

    this.totalFrames = this.frameBrightnessModifiers.length;
  }

  enter() {
    this.letter.currentState = this.letter.states.BLINKING;
  }

  getFrame(deltaTime: number): Pixel[] {
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameCounter < this.totalFrames - 1) {
        this.frameCounter++;
      } else {
        this.frameCounter = 0;
      }
    } else {
      this.frameTimer += deltaTime;
    }

    const pick = super.getFrame(this.letter.charWidth - 1).map((px) => ({
      ...px,
      color: scaleColor(
        px.color,
        this.frameBrightnessModifiers[this.frameCounter]
      ),
    }));

    return pick;
  }
}

export function getSign() {
  return Math.random() > 0.5 ? -1 : 1;
}

export class Hover extends BaseLetterState implements LetterState {
  lastState: States[keyof States] | null = null;
  lastColor: rgb8Bit | null = null;
  frames: rgb8Bit[] | null = null;
  counter = 0;
  transitionFrameCount = 10;

  constructor(letter: Letter) {
    super(letter);
    if (this.letter.attributes['hover:color']) {
      this.color = this.letter.attributes['hover:color'];
    }
  }

  enter() {
    if (this.letter.currentState instanceof Hover) return;
    this.lastState = this.letter.currentState;
    this.lastColor = this.lastState.color;
    this.frames = this.getIncrementsToResolveDif() as unknown as rgb8Bit[];
    this.letter.currentState = this.letter.states.HOVER;
  }

  exit() {
    this.counter = 0;
    this.lastState!.color = this.lastColor!;
    this.letter.currentState = this.lastState!;
    return undefined;
  }

  getColorDif() {
    const dif = this.color.map(
      (channel, i) => channel - (this.lastColor?.[i] ?? 0)
    );
    return dif;
  }

  getIncrementsToResolveDif() {
    const dif = this.getColorDif();
    const signs = dif.map((difChannel) => (difChannel > 0 ? 1 : -1));

    const arr = new Array(this.transitionFrameCount).fill(
      this.lastColor?.slice(0, 3)
    ) as rgb8Bit[];
    return arr.map((rgbColorArray, transitionFrameIndex) => {
      const progress = (transitionFrameIndex + 1) / this.transitionFrameCount;

      return rgbColorArray.map((channel, channelIndex) => {
        const channelDif = Math.abs(dif[channelIndex]);
        const incAmount = Math.ceil(progress * channelDif);
        return channel + incAmount * signs[channelIndex];
      });
    });
  }

  getFrame(deltaTime: number): Pixel[] {
    if (this.counter < this.transitionFrameCount) {
      const nextColor = this.frames![this.counter]!;
      this.lastState!.color = nextColor;
      this.counter++;
    }

    return this.lastState!.getFrame(deltaTime);
  }
}

function scaleColor(color: rgb8Bit, factor: number): rgb8Bit {
  return color.map((channel) => {
    const result = Math.floor(channel * factor);
    if (result > 255) {
      return 255;
    } else if (result < 0) {
      return 0;
    } else {
      return result;
    }
  }) as rgb8Bit;
}

function modColor(color: rgb8Bit, factor: number) {
  const chromaticMod = Math.floor(Math.random() * 10 * factor) * getSign();

  return color.map((channel) => {
    const newChannel =
      (channel - chromaticMod) * factor - (Math.random() > 0.8 ? -50 : 0);
    return newChannel;
  }) as rgb8Bit;
}
