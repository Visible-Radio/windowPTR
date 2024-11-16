import { Point } from '../../utils/typeUtils/intRange';
import { SimpleLayoutObject } from '../Layout';
import { Letter } from '../Letters/Letters';
import { Text } from '../parse/parser';

type NodeMapData = {
  letters: Letter[];
  boundingBoxes: BoundingBox[];
  layoutObjects: SimpleLayoutObject[];
};

export type BoundingBox = {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
  height: number;
  width: number;
};

export function createBoundingBox() {
  const defaultBox = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
    height: 0,
    width: 0,
  };

  const isSet = {
    topLeft: false,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
  };

  let unset = [] as string[];
  const updateUnset = () => {
    unset = Object.entries(isSet)
      .filter(([, setFlagValue]) => !setFlagValue)
      .map(([coord]) => coord);
    if (unset.length === 0) {
      defaultBox.height = defaultBox.bottomLeft.y - defaultBox.topLeft.y;
      defaultBox.width = defaultBox.bottomRight.x - defaultBox.bottomLeft.x;
    }
  };
  updateUnset();

  return {
    getBox() {
      if (unset.length > 0) {
        console.warn(`${unset.join(', ')} for box not yet set`);
      }
      return structuredClone(defaultBox);
    },
    get(coord: Exclude<keyof BoundingBox, 'height' | 'width'>) {
      return { ...defaultBox[coord] };
    },
    set(
      coord: Exclude<keyof BoundingBox, 'height' | 'width'>,
      x: number,
      y: number
    ) {
      if (isSet[coord]) {
        console.warn(
          `Bounding box setter for ${coord} called more than once. The previous value will not be overwritten`
        );
        return;
      }
      defaultBox[coord].x = x;
      defaultBox[coord].y = y;
      isSet[coord] = true;
      updateUnset();
    },
  };
}

export function createBoundingBoxOld() {
  return {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
  };
}

function createNodeMeta(options?: {
  letters?: Letter[];
  boundingBoxes?: BoundingBox[];
  LayoutObjects?: SimpleLayoutObject[];
}): NodeMapData {
  return {
    letters: options?.letters ?? [],
    boundingBoxes: options?.boundingBoxes ?? [],
    layoutObjects: options?.LayoutObjects ?? [],
  };
}

export class NodeMetaMap {
  map: WeakMap<Text, NodeMapData>;
  constructor() {
    this.map = new WeakMap();
  }
  addLetter(node: Text, letter: Letter) {
    if (this.map.has(node)) {
      const meta = this.map.get(node)!;
      meta.letters.push(letter);
    } else {
      this.map.set(node, createNodeMeta({ letters: [letter] }));
    }
  }

  addLayoutObject(node: Text, layoutObject: SimpleLayoutObject) {
    if (this.map.has(node)) {
      const meta = this.map.get(node)!;
      meta.layoutObjects.push(layoutObject);
    } else {
      this.map.set(node, createNodeMeta({ LayoutObjects: [layoutObject] }));
    }
  }
  getAllLettersForTextNode(node: Text) {
    return this.map.get(node)?.letters;
  }
}
