import { gridPositionFromIndex } from '../../utils/gridPositionFromIndex';
import { rgb8Bit } from '../../utils/typeUtils/intRange';
import { applyOutline, determineOutline } from '../draw/outlineChar';
import { Letter, Pixel } from './Letters';

interface LetterState {
  getFrame: () => Pixel[];
  enter: () => void;
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

  getFrame(frameIndex: number): Pixel[] {
    const basePixels = this.applyTransform(
      frameIndex,
      this.letter.def,
      this.color
    );

    let outlinePixels: Pixel[] = [];

    if (this.letter.attributes.outline) {
      const outlineColor = Array.isArray(this.letter.attributes?.outline)
        ? this.letter.attributes.outline
        : this.color;

      outlinePixels = this.applyTransform(
        frameIndex,
        this.outline1dPoints,
        outlineColor
      );
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

export class Hidden implements LetterState {
  letter: Letter;
  constructor(letter: Letter) {
    this.letter = letter;
  }

  enter() {
    /*  */
  }

  /** Returns an empty pixel array */
  getFrame(): Pixel[] {
    return [];
  }
}

export class Idle extends BaseLetterState {
  letter: Letter;
  totalFrames: number;
  constructor(letter: Letter) {
    super(letter);
    this.letter = letter;
    this.totalFrames = this.letter.charWidth - 1;
  }

  enter() {
    /*  */
  }

  /** Returns the letter in it's 'defined' state according to the definition */
  getFrame() {
    return super.getFrame(this.totalFrames);
  }
}

export class Glitching implements LetterState {
  letter: Letter;
  constructor(letter: Letter) {
    this.letter = letter;
  }

  enter() {
    /*  */
  }

  getFrame() {
    return [];
  }
}

export class Blinking implements LetterState {
  letter: Letter;
  constructor(letter: Letter) {
    this.letter = letter;
  }

  enter() {
    /*  */
  }

  getFrame() {
    return [];
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
