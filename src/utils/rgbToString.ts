import { int8Bit } from './typeUtils/intRange';

export function rgbToString(rgbArr: [int8Bit, int8Bit, int8Bit], alpha = 1) {
  const [r, g, b] = rgbArr;
  return `rgba(${r},${g},${b},${alpha})`;
}
