import { SimpleLayoutObject } from '../Layout';
import { compose } from '../utils';

export function applyOutline(
  def: number[],
  charWidth: number,
  type: 'start' | 'middle' | 'end' | null
): number[] {
  switch (type) {
    case 'start':
      return outlineStart(def, charWidth);

    case 'middle':
      return outlineMiddle(def, charWidth);

    case 'end':
      return outlineEnd(def, charWidth);

    default:
      return def;
  }
}

export function outlineStart(def: number[], charWidth: number): number[] {
  const defCopy = [...def];
  return compose(
    outlineTop,
    outlineBottom,
    outlineLeft
  )([defCopy, charWidth])[0];
}

export function outlineMiddle(def: number[], charWidth: number): number[] {
  const defCopy = [...def];
  return compose(outlineTop, outlineBottom)([defCopy, charWidth])[0];
}
export function outlineEnd(def: number[], charWidth: number): number[] {
  const defCopy = [...def];
  return compose(
    outlineTop,
    outlineBottom,
    outlineRight
  )([defCopy, charWidth])[0];
}

export function outlineSingle(def: number[], charWidth: number): number[] {
  const defCopy = [...def];

  const [result] = compose(
    outlineTop,
    outlineBottom,
    outlineLeft,
    outlineRight
  )([defCopy, charWidth]);

  return result;
}

function outlineTop(
  args: [def: number[], charWidth: number]
): [number[], number] {
  const [def, charWidth] = args;
  const topLeft = -charWidth;
  const topRight = -1;
  const increment = 1;
  return [def.concat(getEdgePoints(topLeft, topRight, increment)), charWidth];
}

function outlineBottom(
  args: [def: number[], charWidth: number]
): [number[], number] {
  const [def, charWidth] = args;
  const bottomLeft = charWidth * charWidth;
  const bottomRight = charWidth * charWidth + (charWidth - 1);

  const increment = 1;

  return [
    def.concat(getEdgePoints(bottomLeft, bottomRight, increment)),
    charWidth,
  ];
}

function outlineLeft(
  args: [def: number[], charWidth: number]
): [number[], number] {
  const [def, charWidth] = args;
  const topLeft = 0;
  const bottomLeft = charWidth * charWidth;
  const increment = charWidth;
  return [def.concat(getEdgePoints(topLeft, bottomLeft, increment)), charWidth];
}

function outlineRight(
  args: [def: number[], charWidth: number]
): [number[], number] {
  const [def, charWidth] = args;
  const topRight = charWidth - 1;
  const bottomRight = charWidth * charWidth + (charWidth - 1);
  const increment = charWidth;
  return [
    def.concat(getEdgePoints(topRight, bottomRight, increment)),
    charWidth,
  ];
}

function getEdgePoints(
  start: number,
  end: number,
  increment: number
): number[] {
  const result: number[] = [];

  for (let i = start; i < end + 1; i += increment) {
    result.push(i);
  }

  return result;
}

export function determineOutline(
  layoutList: SimpleLayoutObject[],
  i: number
): 'start' | 'middle' | 'end' | null {
  const prev = layoutList[i - 1];
  const next = layoutList[i + 1];

  if (!prev?.attributes?.outline) {
    return 'start';
  }
  if (prev?.attributes?.outline && next?.attributes?.outline) {
    return 'middle';
  }
  if (!next?.attributes?.outline) {
    return 'end';
  }
  return null;
}
