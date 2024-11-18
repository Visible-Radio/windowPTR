import { traverseReduce } from '../utils/traverseReduce';
import { createBoundingBox, NodeMetaMap } from './NodeMetaMap/NodeMetaMap';
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
    // we're using this as a forEach, not a reduce. hence returning and passing undefined in place of the accumulator
    return traverseReduce(
      this.ptr.documentTree,
      (_, node) => {
        if (node.tag === 'p') {
          this.moveCursorToNewLine();
        }
        if (node instanceof Text) {
          this.layout(node);
        }
        return undefined;
      },
      undefined
    );
  }

  moveCursorToNewLine() {
    this.cursor.x = this.ptr.dm.values.drawAreaLeft_du;
    this.cursor.y += this.stepY;
  }

  private layout(node: Text) {
    this.ptr.nodeMetaMap.clearStale(node);
    const { drawAreaLeft_du } = this.ptr.dm.values;
    const words = node.text.split(' ');
    /* 
    there can be up to three bounding boxes
    for a short Text node that fits entirely on one line, there is one bounding box
    for a longer Text node that wraps onto a second line, there are two bounding boxes
    for a longer still Text node that wraps onto multiple lines, there are three bounding boxes
      - the are in the 'middle' can be described with one box, not matter how many lines the node takes

    build up the bounding boxes from small individual bounding boxes - SINGLE LETTERS!
    go through each letter and accumulate letters with the same Y coordinates into arrays
    each of those arrays corresponds to a bounding box
    */

    for (const [i, word] of words.entries()) {
      if (word.length === 0) continue;
      if (
        /* jump to start of next line if there isn't room in current row for the word */
        !this.ptr.dm.textFits(word, this.cursor.x) &&
        this.cursor.x !== drawAreaLeft_du
      ) {
        this.moveCursorToNewLine();
      }

      // there is either now enough room, or the word will never fit on a single line:
      // hand off layout of chars in word to our character by character layout function
      const partialDisplayList = this.layoutByCharacter(word);
      partialDisplayList.forEach((entry) => {
        const layoutObject = {
          ...entry,
          node,
          attributes: node.ancestorAttributes,
        };
        this.layoutList.push(layoutObject);
        this.ptr.nodeMetaMap.addLayoutObject(node, layoutObject);
      });

      const notLineStart = this.cursor.x !== drawAreaLeft_du;
      // add a space after each word, but not after the last word
      if (i !== words.length - 1) {
        const layoutObject = {
          x: this.cursor.x,
          y: this.cursor.y,
          char: ' ',
          node,
          attributes: node.ancestorAttributes,
        };
        this.layoutList.push(layoutObject);
        this.ptr.nodeMetaMap.addLayoutObject(node, layoutObject);
      }
      if (notLineStart) {
        this.cursor.x += this.stepX;
      }
    }

    this.calculateBoundingBoxesForNode(node);
  }

  calculateBoundingBoxesForNode(node: Text) {
    const nodeMeta = this.ptr.nodeMetaMap.map.get(node);
    if (!nodeMeta || !(nodeMeta.layoutObjects.length > 0)) return;

    /* 
    look at the first letter. this is the start of the first box
    look at the last letter. is the y coordinate of the last letter the same as that of the first?
    if so, that is the end of the first box, and there is only one box
    otherwise, the end of the first box is the right edge of the screen

    look at the last letter. this is the end of the last box
    the start of the last box is the left edge of the screen

    the middle box exists always if the second box exists - even if we only span across 2 rows
    it includes any grid gap areas between rows
    we can derrive it's coordinates from the y coordinates of the other two boxes
    it's x coordinates are the left and right edges of the screen  
    */

    /* for now bounding boxes will use the DU unit */
    const letterHeight = this.ptr.dm.values.cellHeight_du;
    const letterWidth = this.ptr.dm.values.cellWidth_du;

    const firstLetter = nodeMeta.layoutObjects.at(0)!;
    const lastLetter = nodeMeta.layoutObjects.at(-1)!;

    const [firstBox, middleBox, lastBox] = [
      createBoundingBox(),
      createBoundingBox(),
      createBoundingBox(),
    ];

    // handle the first box
    firstBox.set('topLeft', firstLetter.x, firstLetter.y);
    firstBox.set('bottomLeft', firstLetter.x, firstLetter.y + letterHeight);

    if (lastLetter.y === firstLetter.y) {
      /* the text fits on one line, and there is only one box */
      firstBox.set('topRight', lastLetter.x + letterWidth, lastLetter.y);
      firstBox.set(
        'bottomRight',
        lastLetter.x + letterWidth,
        lastLetter.y + letterHeight
      );
      nodeMeta.boundingBoxes = [firstBox.getBox()];
      return;
    } else {
      /* the text has wrapped onto multiple lines, there must be three boxes.
      the first box must extend all the way to the right edge of the screen*/
      firstBox.set(
        'topRight',
        this.ptr.dm.values.drawAreaRight_du,
        firstLetter.y
      );
      firstBox.set(
        'bottomRight',
        this.ptr.dm.values.drawAreaRight_du,
        firstLetter.y + letterHeight
      );
    }

    // handle the 3rd box
    lastBox.set('topLeft', this.ptr.dm.values.drawAreaLeft_du, lastLetter.y);
    lastBox.set(
      'bottomLeft',
      this.ptr.dm.values.drawAreaLeft_du,
      lastLetter.y + letterHeight
    );
    lastBox.set('topRight', lastLetter.x + letterWidth, lastLetter.y);
    lastBox.set(
      'bottomRight',
      lastLetter.x + letterWidth,
      lastLetter.y + letterHeight
    );

    // handle the middle box
    middleBox.set(
      'topLeft',
      this.ptr.dm.values.drawAreaLeft_du,
      firstBox.get('bottomLeft').y
    );
    middleBox.set(
      'topRight',
      this.ptr.dm.values.drawAreaRight_du,
      firstBox.get('bottomLeft').y
    );
    middleBox.set(
      'bottomRight',
      this.ptr.dm.values.drawAreaRight_du,
      lastBox.get('topRight').y
    );
    middleBox.set(
      'bottomLeft',
      this.ptr.dm.values.drawAreaLeft_du,
      lastBox.get('topLeft').y
    );

    nodeMeta.boundingBoxes = [
      firstBox.getBox(),
      middleBox.getBox(),
      lastBox.getBox(),
    ];
  }

  private layoutByCharacter(text: string) {
    const { displayColumns } = this.ptr.dm.values;

    const layoutList = [];
    const lastColumnXCoord = this.ptr.dm.getColumnXCoord_du(displayColumns - 1);

    for (const char of text) {
      layoutList.push({ x: this.cursor.x, y: this.cursor.y, char });

      if (char === '\n') {
        this.moveCursorToNewLine();
        continue;
      }

      if (this.cursor.x === this.ptr.dm.getColumnXCoord_du(0) && char === ' ') {
        // omit spaces at the start of a row
        continue;
      }

      if (this.cursor.x >= lastColumnXCoord) {
        this.moveCursorToNewLine();
      } else {
        this.cursor.x += this.stepX;
      }
    }

    return layoutList;
  }
}
