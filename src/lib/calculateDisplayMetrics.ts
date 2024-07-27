import { TDisplayMetrics } from '../utils/typeUtils/configuredCanvas';
import { rgb8Bit } from '../utils/typeUtils/intRange';

export const displayConfigOptionsDefault = {
  scale: 2,
  displayRows: 8,
  gridSpaceX_du: -3, // measured in DUs
  gridSpaceY_du: 5, // measured in DUs
  borderColor: [200, 0, 120] as rgb8Bit,
  borderWidth_du: 0,
  borderGutter_du: 5,
  drawCellOutlines: false,
  displayColumns: null,
};

export type DisplayConfigOptions = {
  scale: number; // 2,
  displayRows: number; // 8,
  gridSpaceX_du: number; // -3, // measured in DUs
  gridSpaceY_du: number; // 5, // measured in DUs
  borderColor: rgb8Bit; // [200, 0, 120] as rgb8Bit,
  borderWidth_du: number; // 0,
  borderGutter_du: number; // 5,
  drawCellOutlines: boolean; // false,
  displayColumns?: number | undefined; // null,
};

/**
 * Calculates displays metrics based on the size of the root element, options, and character def width
 * @params charWidth - the width of the characters in display units
 * @params root - the root div element
 * @params options - options for scale, number of rows, grid gap and color
 */
export default function calculateDisplayMetrics(
  charWidth: number,
  root: HTMLDivElement,
  options: DisplayConfigOptions
): TDisplayMetrics {
  const {
    scale,
    displayRows,
    gridSpaceX_du,
    gridSpaceY_du,
    borderColor,
    borderWidth_du,
    borderGutter_du,
  } = options;

  const totalBorderWidth_du = borderWidth_du * 2 + borderGutter_du * 2;
  const remainingWidthXPx = root.clientWidth - totalBorderWidth_du * scale;

  const displayColumns = calcColumns(
    remainingWidthXPx,
    scale,
    charWidth,
    gridSpaceX_du
  );

  const displayUnitsPerRow_du = charWidth + gridSpaceY_du;
  const numberOfRowGaps = displayRows - 1;
  const numberOfColumnGaps = displayColumns - 1;

  const displayHeight_du =
    totalBorderWidth_du +
    displayRows * charWidth +
    numberOfRowGaps * gridSpaceY_du;

  const displayHeight_px = displayHeight_du * scale;

  const cellWidth_du = charWidth;
  const cellHeight_du = charWidth;

  const displayWidth_du =
    displayColumns * cellWidth_du +
    numberOfColumnGaps * gridSpaceX_du +
    totalBorderWidth_du;

  const displayWidth_px = displayWidth_du * scale;

  const drawAreaLeft_du = borderWidth_du + borderGutter_du;
  const drawAreaTop_du = borderWidth_du + borderGutter_du;

  const drawAreaRight_du =
    displayWidth_du - (borderGutter_du + borderWidth_du) * 2;

  const drawAreaBottom_du =
    displayHeight_du - (borderGutter_du + borderWidth_du);

  const drawAreaWidth_du = drawAreaRight_du - drawAreaLeft_du;

  const drawAreaHeight_du = drawAreaBottom_du - drawAreaTop_du;

  const displayMetrics: TDisplayMetrics = {
    displayWidth_px,
    displayHeight_px,
    displayWidth_du,
    displayHeight_du,
    displayUnitsPerRow_du,
    displayColumns,
    displayRows,
    borderWidth_du,
    totalBorderWidth_du,
    borderGutter_du,
    remainingWidthXPx,
    scale,
    gridSpaceX_du,
    gridSpaceY_du,
    borderColor,
    drawAreaLeft_du,
    drawAreaTop_du,
    drawAreaRight_du,
    drawAreaBottom_du,
    drawAreaWidth_du,
    drawAreaHeight_du,
    cellWidth_du,
    cellHeight_du,
  };

  return displayMetrics;
}

/**
 * Determines the number of columns that can fit based on the size of the root div, scale, cell width, and horizontal spacing
 * @param remainingWidthXPx width of root div less borders and padding
 * @param scale
 * @param cellWidth_du
 * @param gridSpaceX_du
 * @returns
 */
function calcColumns(
  remainingWidthXPx: number,
  scale: number,
  cellWidth_du: number,
  gridSpaceX_du: number
) {
  let remaining = remainingWidthXPx;
  let count = 0;
  const deduct = cellWidth_du * scale + gridSpaceX_du * scale;
  while (remaining + gridSpaceX_du * scale > deduct) {
    remaining -= deduct;
    count++;
  }
  return count;
}
