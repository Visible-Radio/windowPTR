import { PTR } from './PTR';

export class ScrollHandler {
  ptr: PTR;
  frameTimer = 0;
  frameCounter = 0;
  constructor(ptr: PTR) {
    /*  */
    this.ptr = ptr;
  }

  update() {
    const scrollThreshold =
      this.ptr.scrollY +
      this.ptr.dm.values.displayHeight_du -
      this.ptr.dm.values.cellHeight_du -
      this.ptr.dm.values.borderGutter_du -
      this.ptr.dm.values.borderWidth_du -
      0;

    const i = this.ptr.letters.list.findIndex(
      (letter) => !letter.states.FIRST_DRAW.done
    );

    const currentLetter =
      this.ptr.letters.list[i] ?? this.ptr.letters.list.at(-1);

    if (currentLetter?.position.y > scrollThreshold) {
      this.scroll();
    }
  }
  scroll() {
    if (this.frameCounter === 1) {
      this.frameCounter = 0;
      this.ptr.scrollY += 1;
    } else {
      this.frameCounter += 1;
    }
  }
}
