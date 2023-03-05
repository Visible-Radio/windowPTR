import { int8Bit } from "./typeUtils/intRange";

export function rgbToString(rgbArr: [int8Bit, int8Bit, int8Bit]) {
  const [r, g, b] = rgbArr;
  return `rgb(${r},${g},${b})`;
}
