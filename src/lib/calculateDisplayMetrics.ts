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
