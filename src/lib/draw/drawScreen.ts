import { gridPositionFromIndex } from '../../utils/gridPositionFromIndex';
import { rgbToString } from '../../utils/rgbToString';
import { PTR } from '../PTR';
import { SimpleLayoutObject } from '../layout/layoutByCharacter';
import { invertChar } from './invertChar';
import { applyOutline } from './outlineChar';

export function drawScreen(ptr: PTR) {
  const scrollY_du = ptr.scrollY;
  const { values } = ptr.dm;
  const { layoutList } = ptr.layout;
  const { ctx } = ptr;

  ptr.ctx.fillStyle = rgbToString(values.borderColor);

  for (let i = 0; i < layoutList.length; i++) {
    const { x: cursorX_du, y: cursorY_du, char, attributes } = layoutList[i];
    if (
      cursorY_du > scrollY_du + values.drawAreaBottom_du ||
      cursorY_du + values.cellHeight_du < scrollY_du
    ) {
      continue;
    }

    const c = char.toUpperCase() in ptr.defs ? char.toUpperCase() : ' ';

    const current = attributes?.highlight
      ? invertChar(ptr.defs[c], ptr.defs.charWidth)
      : ptr.defs[c];

    ctx.fillStyle = attributes?.color ?? rgbToString(values.borderColor);
    drawPoints(current, cursorX_du, cursorY_du, ptr);

    if (attributes?.outline) {
      ctx.fillStyle =
        typeof attributes?.outline === 'string'
          ? attributes?.outline
          : rgbToString(values.borderColor);
      const outlinePoints = applyOutline(
        [],
        ptr.defs.charWidth,
        determineOutline(layoutList, i)
      );
      drawPoints(outlinePoints, cursorX_du, cursorY_du, ptr);
    }
  }
}

function drawPoints(
  points: number[],
  cursorX_du: number,
  cursorY_du: number,
  ptr: PTR
): void {
  points.forEach((point: number) => {
    const { x, y } = gridPositionFromIndex({
      index: point,
      columns: ptr.dm.values.cellWidth_du,
    });

    const adjustedX = x + cursorX_du;
    const adjustedY = y + cursorY_du - ptr.scrollY;

    if (
      !(
        ptr.dm.values.drawAreaBottom_du < adjustedY ||
        adjustedY < ptr.dm.values.drawAreaTop_du - 2 ||
        adjustedX > ptr.dm.values.drawAreaRight_du + 2
      )
    ) {
      // prevent drawing pixels in gutters
      ptr.drawingTools.fillRect_du(adjustedX, adjustedY, 1, 1);
    }
  });
}

function determineOutline(
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
