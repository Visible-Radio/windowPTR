import { rgb8Bit } from './intRange';

export type TDisplayMetrics = Readonly<{
  borderColor: rgb8Bit;
  /**
   * horizontal grid gap in Display Units between character cells
   */
  gridSpaceX_du: number;
  /**
   * vertical grid gap in Display Units between character cells
   */
  gridSpaceY_du: number;
  /**
   * Width of display border in Display Units
   */
  borderWidth_du: number;
  /**
   * Width of display padding in Display Units
   */
  borderGutter_du: number;
  /**
   * The total width of the left and right borders + left and right gutters
   * The total width of the top and bottom borders + top and bottom gutters
   */
  totalBorderWidth_du: number;
  /**
   * The difference in pixels of the root div element width less the space needed for borders and padding
   * ie. the width of the 'draw area'
   */
  remainingWidthXPx: number;
  /**
   * Number of columns in the display as derived from the character definitions and width of the draw area
   */
  displayColumns: number;
  /**
   * Number of rows in the display as specified in the canvas config options
   */
  displayRows: number;
  /**
   * what is this for? makes it sound like it should be the height of each row, but it is not.
   */
  displayUnitsPerRow_du: number;
  /**
   *  Total width of the display, including borders + padding in Display Units
   */
  displayWidth_du: number;
  /**
   *  Total width of the display in pixels, including borders + padding
   */
  displayWidth_px: number;
  /**
   *  Total height of the display in DisplayUnits, including borders + padding
   */
  displayHeight_du: number;
  /**
   *  Total height of the display in pixels, including borders + padding
   */
  displayHeight_px: number;

  /**
   * x coordinate in Display Units for the left edge of the draw area
   */
  drawAreaLeft_du: number;

  /**
   * y coordinate in Display Units for the top edge of the draw area
   */
  drawAreaTop_du: number;

  /** x coordinate in Display units for the right edge of the draw area */
  drawAreaRight_du: number;

  /** y coordinate in Display units for the bottom edge of the draw area */
  drawAreaBottom_du: number;

  /** width of the draw area in Display units */
  drawAreaWidth_du: number;

  /** height of the draw area in Display units */
  drawAreaHeight_du: number;

  /**
   * width in Display Units of each character cell. Does not include gridSpaceX
   */
  cellWidth_du: number;

  /**
   * height in Display Units of each character cell. Does not include gridSpaceY
   */
  cellHeight_du: number;
  scale: number;

  /** Determines the x cooridinate of the given column. Input is zero indexed. */
  // getColumnXCoord_du: (columnNo: number) => number;

  // /** Determines the column number of the given x coordinate.*/
  // getColumnFromXCoord_du: (xCoord: number) => number;

  // /** Determines the amount of space in display units to the right of the given xCoord.*/
  // getRemainingRowSpace_du: (xCoord: number) => number;

  // /** Returns the space in display units required to layout a piece of text on the display */
  // measureText: (text: string) => number;

  // /** Determines whether a piece of text fits in a row */
  // textFits: (text: string, xCoord: number) => boolean;
}>;
