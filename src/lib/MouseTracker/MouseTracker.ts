import { PTR } from '../PTR';

export class MouseTracker {
  ptr: PTR;
  x = 0;
  y = 0;
  x_du = 0;
  y_du = 0;
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

  padNumber(num: number) {
    return num.toString().padStart(4, '_');
  }

  logPosition(event: MouseEvent, label: string) {
    console.log(
      `__X ${this.padNumber(event.offsetX)} __Y ${this.padNumber(
        event.offsetY
      )} ${label}`
    );
    console.log(
      `xdu ${this.padNumber(this.x_du)} ydu ${this.padNumber(this.y_du)}`
    );
  }

  onMouseMove(event: MouseEvent) {
    // this.logPosition(event, 'onMouseMove');
    this.x = event.offsetX;
    this.y = event.offsetY;

    this.x_du = Math.round(this.x / this.ptr.dm.values.scale);
    this.y_du = Math.round(this.y / this.ptr.dm.values.scale);
  }

  onMouseEnter(event: MouseEvent) {
    // this.logPosition(event, 'onMouseEnter');
    this.onScreen = true;
  }

  onMouseLeave(event: MouseEvent) {
    // this.logPosition(event, 'onMouseLeave');
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

    so...
    we need our node meta data lookup map...
    */
  }
}
