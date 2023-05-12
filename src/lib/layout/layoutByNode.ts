import { traverseReduce } from "../../utils/traverseReduce";
import { DisplayMetrics } from "../../utils/typeUtils/configuredCanvas";
import { AttributeMap, Element, Text, printTree } from "../parse/parser";
import { layoutByCharacter } from "./layoutByCharacter";

export interface layoutByNodeArgs {
  tree: Element;
  dm: DisplayMetrics;
  initCursorX_du?: number;
  initCursorY_du?: number;
}

export function layoutByNode({
  tree,
  dm,
  initCursorX_du,
  initCursorY_du,
}: layoutByNodeArgs) {
  printTree(tree);
  const initAcc: layoutByNodeAccumulator = {
    layoutList: [] as Char[],
    xStep: dm.cellWidth_du + dm.gridSpaceX_du,
    yStep: dm.cellHeight_du + dm.gridSpaceY_du,
    cursorX_du: initCursorX_du ?? dm.drawAreaLeft_du,
    cursorY_du: initCursorY_du ?? dm.drawAreaTop_du,
  };

  return traverseReduce(
    tree,
    (acc, node) => {
      if (node.tag === "p") {
        acc.cursorY_du += acc.yStep;
        acc.cursorX_du = dm.drawAreaLeft_du;
      }
      if (node instanceof Text) {
        layout(node, acc, dm);
      }
      return acc;
    },
    initAcc
  ).layoutList;
}

interface layoutByNodeAccumulator {
  layoutList: Char[];
  xStep: number;
  yStep: number;
  cursorX_du: number;
  cursorY_du: number;
}

function layout(node: Text, acc: layoutByNodeAccumulator, dm: DisplayMetrics) {
  const getNode = () => node;
  const words = node.text.split(" ");
  for (const [i, word] of words.entries()) {
    if (word.length === 0) continue;
    if (
      /* jump to start of next line if there isn't room in current row for the word */
      !dm.textFits(word, acc.cursorX_du) &&
      acc.cursorX_du !== dm.drawAreaLeft_du
    ) {
      acc.cursorX_du = dm.drawAreaLeft_du;
      acc.cursorY_du += acc.yStep;
    }

    // there is either now enough room, or the word will never fit on a single line:
    // hand off layout of chars in word to our character by character layout function
    const {
      layoutList: partialDisplayList,
      x: newX,
      y: newY,
    } = layoutByCharacter({
      simpleText: word,
      dm,
      initialCursor: { x: acc.cursorX_du, y: acc.cursorY_du },
    });

    partialDisplayList.forEach(entry =>
      acc.layoutList.push(
        new Char({
          ...entry,
          attributes: node.ancestorAttributes,
          node: getNode,
        })
      )
    );

    acc.cursorX_du = newX;
    acc.cursorY_du = newY;

    const notLineStart = acc.cursorX_du !== dm.drawAreaLeft_du;
    if (notLineStart) {
      acc.layoutList.push(
        new Char({
          x: acc.cursorX_du,
          y: acc.cursorY_du,
          char: " ",
          attributes: i === words.length - 1 ? {} : node.ancestorAttributes,
          node: getNode,
        })
      );
      acc.cursorX_du += acc.xStep;
    }
  }
}

class Char {
  protected __x: number;
  protected __y: number;
  protected __char: string;
  protected __attributes: AttributeMap;
  protected __node: () => Text;
  constructor({
    x,
    y,
    char,
    attributes,
    node,
  }: {
    x: number;
    y: number;
    char: string;
    attributes: AttributeMap;
    node: () => Text;
  }) {
    this.__x = x;
    this.__y = y;
    this.__char = char;
    this.__attributes = attributes;
    this.__node = node;
  }

  get x() {
    return this.__x;
  }
  get y() {
    return this.__y;
  }
  get coords() {
    return { x: this.__x, y: this.__y };
  }
  getTextNode() {
    return this.__node();
  }
  get char() {
    return this.__char;
  }
  get attributes() {
    return this.__attributes;
  }
}
