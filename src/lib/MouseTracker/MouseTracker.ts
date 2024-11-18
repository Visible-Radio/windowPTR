import { Point } from '../../utils/typeUtils/intRange';
import { BoundingBox } from '../NodeMetaMap/NodeMetaMap';
import { Node, Text } from '../parse/parser';
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
    this.ptr.canvasElement.addEventListener('click', (event) =>
      this.handleClick(event)
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

  handleClick(event: MouseEvent) {
    /*  */
    // this.logPosition(event, 'handleClick');
    this.ptr.printTree();

    this.ptr.visitNodes((node) => {
      if (node instanceof Text) {
        const meta = this.ptr.nodeMetaMap.map.get(node);
        if (!meta) return;
        meta.boundingBoxes.forEach((box) => {
          if (isPointInBox({ x: this.x_du, y: this.y_du }, box)) {
            /* 
            actually, we need to now traverse back up the chain of ancestors
            and search for click handlers
            for our purposes, we should fire the closest one            
            */

            /* 
            may want to compare bounding box areas
            the most specific node in which the event occured
            is the node with the smallest total bounding box area
            */
            const nodeAttributes = traverseAncestors(node, (node) => {
              if (node instanceof Text) {
                return undefined;
              } else {
                return node.attributes.onClick;
              }
            });
            console.log(nodeAttributes);
          }
        });
      }
    });
  }
}

// the type comes out of traverseAncestors correctly, so this is fine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function traverseAncestors<T extends (arg0: Node) => any>(
  node: Node,
  collectorFn: T,
  acc: Array<NonNullable<ReturnType<T>>> = []
) {
  const collectorResult = collectorFn(node);
  if (node.parent) {
    return traverseAncestors(
      node.parent,
      collectorFn,
      collectorResult ? [...acc, collectorResult] : acc
    );
  }
  return acc;
}

function isPointInBox(point: Point, boundingBox: BoundingBox): boolean {
  /* we'll likely also need to account for scroll position */
  return (
    point.x >= boundingBox.topLeft.x &&
    point.x <= boundingBox.bottomRight.x &&
    point.y >= boundingBox.topLeft.y &&
    point.y <= boundingBox.bottomRight.y
  );
}
