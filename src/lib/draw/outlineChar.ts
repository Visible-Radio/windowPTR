import { compose } from "../utils";

export function applyOutline(
  def: number[],
  charWidth: number,
  type: "start" | "middle" | "end" | null
): number[] {
  switch (type) {
    case "start":
      return outlineStart(def, charWidth);

    case "middle":
      return outlineMiddle(def, charWidth);

    case "end":
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
  // const topLeft = 0 - charWidth * 2;
  // const topRight = 0 - charWidth - 1;
  const topLeft = -charWidth;
  const topRight = -1;
  const increment = 1;
  return [def.concat(getEdgePoints(topLeft, topRight, increment)), charWidth];
}

function outlineBottom(
  args: [def: number[], charWidth: number]
): [number[], number] {
  const [def, charWidth] = args;
  // const bottomLeft = charWidth * charWidth - charWidth;
  // const bottomRight = charWidth * charWidth - 1;

  // const bottomLeft = charWidth * charWidth + charWidth;
  // const bottomRight = charWidth * charWidth + (charWidth * 2 - 1);

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
  // const topLeft = 0 - charWidth * 2;

  // const bottomLeft = charWidth * charWidth - charWidth;
  // const bottomLeft = charWidth * charWidth + charWidth;
  const bottomLeft = charWidth * charWidth;

  const increment = charWidth;
  return [def.concat(getEdgePoints(topLeft, bottomLeft, increment)), charWidth];
}

function outlineRight(
  args: [def: number[], charWidth: number]
): [number[], number] {
  const [def, charWidth] = args;
  const topRight = charWidth - 1;
  // const topRight = 0 - charWidth - 1;
  // const bottomRight = charWidth * charWidth - 1;
  // const bottomRight = charWidth * charWidth + (charWidth * 2 - 1);
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
