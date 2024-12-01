import { traverseReduce } from '../../utils/traverseReduce';
import { Point } from '../../utils/typeUtils/intRange';
import { Letter } from '../Letters/Letters';
import { Hover } from '../Letters/states';
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
  hoveredLetters: Letter[] = [];
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

    const newHoveredNodes = this.getHoveredInteractiveElements();
    const newHoveredLetters = newHoveredNodes.length
      ? this.getLettersFromElement(newHoveredNodes[0])
      : [];

    this.hoveredLetters.forEach((letter) => {
      if (!newHoveredLetters.includes(letter)) {
        letter.currentState.exit();
      }
    });

    newHoveredLetters.forEach((letter) => {
      if (!(letter.currentState instanceof Hover)) {
        letter.setState('HOVER');
      }
    });

    this.hoveredNodes = newHoveredNodes;
    this.hoveredLetters = newHoveredLetters;
    this.setCursorType();
  }

  setCursorType() {
    if (this.hoveredNodes.length) {
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
        this.ptr.functions[onClick](
          this.ptr,
          this.getLettersFromElement(this.hoveredNodes[0])
        );
      } else {
        console.warn(`Requested function call ${onClick} unavailable`);
      }
    }
  }

  getLettersFromElement(element: Element) {
    return traverseReduce(
      element,
      (acc, node) => {
        if (node instanceof Text) {
          /* use the node to lookup letters from nodeMetaMap
          and return the letters via the acc
          */
          const nodeMeta = this.ptr.nodeMetaMap.map.get(node);
          if (!nodeMeta) return acc;
          acc.push(...nodeMeta.letters);
        }
        return acc;
      },
      [] as Letter[]
    );
  }
}

// the type comes out of traverseAncestors correctly, so this is fine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function traverseAncestors<T extends (arg0: Node) => any>(
  node: Node,
  collectorFn: T,
  acc: Array<NonNullable<ReturnType<T>>> = []
): Array<NonNullable<ReturnType<T>>> {
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
