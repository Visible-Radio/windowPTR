import { DisplayMetrics } from "../utils/typeUtils/configuredCanvas";
import { rgb8Bit } from "../utils/typeUtils/intRange";

export const canvasConfigOptionsDefault = {
  scale: 4,
  displayRows: 10,
  gridSpaceX_du: -1, // measured in DUs
  gridSpaceY_du: 1, // measured in DUs
  borderColor: [200, 0, 120] as rgb8Bit,
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
  options = canvasConfigOptionsDefault
): DisplayMetrics {
  const { scale, displayRows, gridSpaceX_du, gridSpaceY_du, borderColor } =
    options;

  const borderWidth_du = 1;
  const borderGutter_du = 1;
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

  // could also add lastColumnXCoord_du
  // or even an array of all column xCoords

  const displayMetrics: DisplayMetrics = {
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
    getColumnXCoord_du(columnNo) {
      return (
        columnNo * cellWidth_du + gridSpaceX_du * columnNo + drawAreaLeft_du
      );
    },
    getColumnFromXCoord_du(xCoord) {
      let col = 0;
      let seek = 0;
      while (seek !== xCoord - drawAreaLeft_du) {
        seek += cellWidth_du + gridSpaceX_du;
        col += 1;
      }
      return col;
    },
    getRemainingRowSpace_du(xCoord) {
      return displayWidth_du - xCoord - drawAreaLeft_du;
    },
    measureText(text) {
      return text.length * cellWidth_du + (text.length - 1) * gridSpaceX_du;
    },
    textFits(text, xCoord) {
      // word.length * dm.cellWidth_du + (word.length - 1) * dm.gridSpaceX_du >
      // dm.getRemainingRowSpace_du(cursorX_du)
      return this.measureText(text) <= this.getRemainingRowSpace_du(xCoord);
    },
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
