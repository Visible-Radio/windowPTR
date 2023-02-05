import { int8Bit } from "../utils/typeUtils/intRange";
import customDefs from "./customDefs_charWidth_7";

export function makeCanvas(container: HTMLDivElement) {
  const canvas = document.createElement("canvas");
  canvas.style.outline = `1px solid blue`;
  container.appendChild(canvas);
  return canvas;
}

export function rgbToString(rgbArr: [int8Bit, int8Bit, int8Bit]) {
  const [r, g, b] = rgbArr;
  return `rgb(${r},${g},${b})`;
}

export function modifyDefs(defs: typeof customDefs) {
  return Object.fromEntries(
    Object.entries(defs).map(([key, value]) => {
      if (key === "charWidth" && typeof value === "number") {
        return [key, value + 2];
      } else if (typeof value === "number") {
        return [key, value];
      } else {
        // remap the points as though they belong in a grid 2 columns wider
        // this guarantees that in order to 'highlight' any char, we can simply invert that cell
        // since we have a border in which no square contains part of the character
        return [
          key,
          value.map(pointIndex => {
            // for each row in the new grid, add 1 to the point Indexes in that row
            return (pointIndex +=
              2 * Math.floor(pointIndex / defs.charWidth) +
              1 +
              defs.charWidth +
              2);
          }),
        ];
      }
    })
  );
}
