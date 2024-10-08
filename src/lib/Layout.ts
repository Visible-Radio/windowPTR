import { traverseReduce } from '../utils/traverseReduce';
import { PTR } from './PTR';
import { AttributeMap, Text } from './parse/parser';

export interface SimpleLayoutObject {
  x: number;
  y: number;
  char: string;
  attributes?: AttributeMap;
  node?: Text;
}

export class Layout {
  public layoutList: SimpleLayoutObject[] = [];
  public cursor: { x: number; y: number };
  public stepX: number;
  public stepY: number;
  private ptr: PTR;
  constructor(ptr: PTR) {
    this.ptr = ptr;
    const { values } = this.ptr.dm;
    this.cursor = {
      x: values.drawAreaLeft_du,
      y: values.drawAreaTop_du,
    };
    this.stepX = values.cellWidth_du + values.gridSpaceX_du;
    this.stepY = values.cellHeight_du + values.gridSpaceY_du;
    this.layoutByNode();
  }

  private layoutByNode() {
    const { drawAreaLeft_du } = this.ptr.dm.values;
    // we're using this as a forEach, not a reduce. hence returning and passing undefined in place of the accumulator
    return traverseReduce(
      this.ptr.documentTree,
      (_, node) => {
        if (node.tag === 'p') {
          this.cursor.y += this.stepY;
          this.cursor.x = drawAreaLeft_du;
        }
        if (node instanceof Text) {
          this.layout(node);
        }
        return undefined;
      },
      undefined
    );
  }

  private layout(node: Text) {
    const { drawAreaLeft_du } = this.ptr.dm.values;
    const words = node.text.split(' ');
    for (const [i, word] of words.entries()) {
      if (word.length === 0) continue;
      if (
        /* jump to start of next line if there isn't room in current row for the word */
        !this.ptr.dm.textFits(word, this.cursor.x) &&
        this.cursor.x !== drawAreaLeft_du
      ) {
        this.cursor.x = drawAreaLeft_du;
        this.cursor.y += this.stepY;
      }

      // there is either now enough room, or the word will never fit on a single line:
      // hand off layout of chars in word to our character by character layout function
      const partialDisplayList = this.layoutByCharacter(word);
      partialDisplayList.forEach((entry) =>
        this.layoutList.push({
          ...entry,
          node,
          attributes: node.ancestorAttributes,
        })
      );

      const notLineStart = this.cursor.x !== drawAreaLeft_du;
      // add a space after each word, but not after the last word
      if (i !== words.length - 1) {
        this.layoutList.push({
          x: this.cursor.x,
          y: this.cursor.y,
          char: ' ',
          node,
          attributes: node.ancestorAttributes,
        });
      }
      if (notLineStart) {
        this.cursor.x += this.stepX;
      }
    }
  }

  private layoutByCharacter(text: string) {
    const { displayColumns, drawAreaLeft_du } = this.ptr.dm.values;

    const layoutList = [];
    const lastColumnXCoord = this.ptr.dm.getColumnXCoord_du(displayColumns - 1);

    for (const char of text) {
      layoutList.push({ x: this.cursor.x, y: this.cursor.y, char });

      if (char === '\n') {
        this.cursor.x = drawAreaLeft_du;
        this.cursor.y += this.stepY;
        continue;
      }

      if (this.cursor.x === this.ptr.dm.getColumnXCoord_du(0) && char === ' ') {
        // omit spaces at the start of a row
        continue;
      }

      if (this.cursor.x >= lastColumnXCoord) {
        this.cursor.x = drawAreaLeft_du;
        this.cursor.y += this.stepY;
      } else {
        this.cursor.x += this.stepX;
      }
    }

    return layoutList;
  }
}
