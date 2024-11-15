import { PTR } from '../PTR';

export class MouseTracker {
  ptr: PTR;
  x = 0;
  y = 0;
  onScreen = false;
  constructor(ptr: PTR) {
    this.ptr = ptr;
    this.ptr.canvasElement.addEventListener('mousemove', (event) =>
      this.onMouseMove(event)
    );
    this.ptr.canvasElement.addEventListener('mouseenter', (event) =>
      this.onMouseEnter(event)
    );
    this.ptr.canvasElement.addEventListener('mouseleave', (event) =>
      this.onMouseLeave(event)
    );
  }

  logRawPosition(event: MouseEvent, label: string) {
    console.log(
      `X ${event.offsetX.toString().padStart(4, '_')} Y ${event.offsetY
        .toString()
        .padStart(4, '_')} ${label}`
    );
  }

  onMouseMove(event: MouseEvent) {
    this.logRawPosition(event, 'onMouseMove');
    this.x = event.offsetX;
    this.y = event.offsetY;
  }

  onMouseEnter(event: MouseEvent) {
    this.logRawPosition(event, 'onMouseEnter');
    this.onScreen = true;
  }

  onMouseLeave(event: MouseEvent) {
    this.logRawPosition(event, 'onMouseLeave');
    this.onScreen = false;
  }

  // we can try this
  getLetterAtPosition(x: number, y: number) {
    /*  */
  }

  // but I suspect we actually want this
  getNodesAtPosition(x: number, y: number) {
    /* 
    we need _all_ of the nodes in which the cursor is positioned
    because _any_ of them could have an onclick handler or hover behavior attached
    so we need the whole chain of ancestors - from the most specific node, all the way back to the root
    */
  }
}
