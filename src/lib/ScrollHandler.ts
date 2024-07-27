import { PTR } from './PTR';

export class ScrollHandler {
  ptr: PTR;
  frameInterval = 128; // how long should a frame last
  frameTimer = 0;
  frameCounter = 0;
  constructor(ptr: PTR) {
    /*  */
    this.ptr = ptr;
  }

  update(deltaTime: number) {
    const scrollThreshold =
      this.ptr.scrollY +
      this.ptr.dm.values.displayHeight_du -
      this.ptr.dm.values.cellHeight_du -
      this.ptr.dm.values.gridSpaceY_du;

    if (this.ptr.letters.currentLetter?.position.y > scrollThreshold) {
      this.ptr.letters.pause();
      this.scroll(deltaTime);
    }
    if (
      this.ptr.letters.pauseUpdates &&
      this.ptr.letters.currentLetter?.position.y <= scrollThreshold
    ) {
      this.ptr.letters.unPause();
    }
  }
  scroll(deltaTime: number) {
    if (this.frameCounter === 1) {
      this.frameCounter = 0;
      this.ptr.scrollY += 1;
    } else {
      this.frameCounter += 1;
    }
  }
}
