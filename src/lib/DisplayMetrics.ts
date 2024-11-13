import { TDisplayMetrics } from '../utils/typeUtils/configuredCanvas';
import { DisplayConfigOptions } from './calculateDisplayMetrics';

export class DisplayMetrics {
  private charWidth: number;
  private root: HTMLDivElement;
  private options: DisplayConfigOptions;
  private metrics: TDisplayMetrics;
  constructor({
    charWidth,
    root,
    options,
  }: {
    charWidth: number;
    root: HTMLDivElement;
    options: DisplayConfigOptions;
  }) {
    this.charWidth = charWidth;
    this.root = root;
    this.options = options;
    this.metrics = this.calculateMetrics();
  }
  get values() {
    return this.metrics;
  }

  getOptions() {
    return this.options;
  }
  setOptions(
    callback: (currentOptions: DisplayConfigOptions) => DisplayConfigOptions
  ) {
    this.options = callback(this.options);
    this.metrics = this.calculateMetrics();
    return this.metrics;
  }
  /** Determines the x cooridinate of the given column. Input is zero indexed. */
  getColumnXCoord_du(columnNo: number): number {
    const { cellWidth_du, gridSpaceX_du, drawAreaLeft_du } = this.metrics;
    return columnNo * cellWidth_du + gridSpaceX_du * columnNo + drawAreaLeft_du;
  }
  /** Determines the column number of the given x coordinate.*/
  getColumnFromXCoord_du(xCoord: number): number {
    const { drawAreaLeft_du, cellWidth_du, gridSpaceX_du } = this.metrics;
    let col = 0;
    let seek = 0;
    while (seek !== xCoord - drawAreaLeft_du) {
      seek += cellWidth_du + gridSpaceX_du;
      col += 1;
    }
    return col;
  }
  /** Determines the amount of space in display units to the right of the given xCoord.*/
  getRemainingRowSpace_du(xCoord: number): number {
    const { displayWidth_du, drawAreaLeft_du } = this.metrics;
    return displayWidth_du - xCoord - drawAreaLeft_du;
  }

  /** Returns the space in display units required to layout a piece of text on the display */
  measureText(text: string) {
    const { gridSpaceX_du, cellWidth_du } = this.metrics;
    return text.length * cellWidth_du + (text.length - 1) * gridSpaceX_du;
  }
  /** Determines whether a piece of text fits in a row */
  textFits(text: string, xCoord: number): boolean {
    return this.measureText(text) <= this.getRemainingRowSpace_du(xCoord);
  }

  calculateMetrics(): TDisplayMetrics {
    const {
      scale,
      displayRows,
      gridSpaceX_du,
      gridSpaceY_du,
      borderColor,
      borderWidth_du,
      borderGutter_du,
    } = this.options;

    const totalBorderWidth_du = borderWidth_du * 2 + borderGutter_du * 2;

    const remainingWidthXPx =
      this.root.clientWidth - totalBorderWidth_du * scale;

    /* make displayColumns the MAXIMUM display columns*/
    const calculatedColumns = calcColumns(
      remainingWidthXPx,
      scale,
      this.charWidth,
      gridSpaceX_du
    );

    let displayColumns: number;
    if (
      this.options.displayColumns &&
      this.options.displayColumns < calculatedColumns
    ) {
      displayColumns = this.options.displayColumns;
    } else {
      displayColumns = calculatedColumns > 0 ? calculatedColumns : 1;
    }

    const displayUnitsPerRow_du = this.charWidth + gridSpaceY_du;

    const numberOfRowGaps = displayRows - 1;

    const numberOfColumnGaps = displayColumns - 1;

    const displayHeight_du =
      totalBorderWidth_du +
      displayRows * this.charWidth +
      numberOfRowGaps * gridSpaceY_du;

    const displayHeight_px = displayHeight_du * scale;

    const cellWidth_du = this.charWidth;

    const cellHeight_du = this.charWidth;

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

    const ret = {
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
    this.metrics = ret;
    return ret;
  }
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
