import { Point } from '../../utils/typeUtils/intRange';
import { BoundingBox } from '../NodeMetaMap/NodeMetaMap';
import { Element, Node, Text } from '../parse/parser';
import { PTR } from '../PTR';

export class MouseTracker {
  ptr: PTR;
  x = 0;
  y = 0;
  x_du = 0;
  y_du = 0;
  onScreen = false;
  hoveredNodes: Element[] = [];
  cursorType: 'crossHair' | 'pointer' = 'crossHair';
  constructor(ptr: PTR) {
    this.ptr = ptr;
    this.ptr.canvasElement.addEventListener('mousemove', (event) =>
      this.onMouseMove(event)
    );
    this.ptr.canvasElement.addEventListener('mouseenter', () =>
      this.onMouseEnter()
    );
    this.ptr.canvasElement.addEventListener('mouseleave', () =>
      this.onMouseLeave()
    );
    this.ptr.canvasElement.addEventListener('click', () => this.handleClick());
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
    this.x = event.offsetX;
    this.y = event.offsetY;
    this.x_du = Math.round(this.x / this.ptr.dm.values.scale);
    this.y_du = Math.round(this.y / this.ptr.dm.values.scale);
    this.hoveredNodes = this.getHoveredInteractiveElements();
    if (this.hoveredNodes.length > 0) {
      this.cursorType = 'pointer';
    } else {
      this.cursorType = 'crossHair';
    }
  }

  onMouseEnter() {
    this.onScreen = true;
  }

  onMouseLeave() {
    this.onScreen = false;
  }

  getHoveredInteractiveElements() {
    const elements: Element[] = [];
    this.ptr.visitNodes((node) => {
      if (node instanceof Text) {
        const meta = this.ptr.nodeMetaMap.map.get(node);
        if (!meta) return;
        meta.boundingBoxes.forEach((box) => {
          if (
            isPointInBox({ x: this.x_du, y: this.y_du + this.ptr.scrollY }, box)
          ) {
            const ancestorTraverseResult = traverseAncestors(node, (node) => {
              if (node instanceof Text) {
                return undefined;
              } else {
                return node.attributes.onClick ? node : undefined;
              }
            });
            elements.push(...ancestorTraverseResult);
          }
        });
      }
    });
    return elements;
  }

  handleClick() {
    const onClick = this.hoveredNodes[0]?.attributes.onClick;
    if (onClick) {
      if (this.ptr.functions && onClick in this.ptr.functions) {
        this.ptr.functions[onClick](this.ptr);
      } else {
        console.warn(`Requested function call ${onClick} unavailable`);
      }
    }
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
