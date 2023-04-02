import customDefs_charWidth_7 from "../lib/customDefs_charWidth_7";
const margin = 3; // changing this may also require changing gridSpaceX
export function modifyDefs(defs: typeof customDefs_charWidth_7) {
  const { charWidth } = defs;
  return Object.fromEntries(
    Object.entries(defs).map(([key, value]) => {
      if (key === "charWidth" && typeof value === "number") {
        return [key, value + margin * 2];
      } else if (typeof value === "number") {
        return [key, value];
      } else {
        // remap the points as though they belong in a grid wider by margin * 2
        // this guarantees that in order to 'highlight' any char, we can simply invert that cell
        // since we have a border in which no square contains part of the character
        return [
          key,
          value.map(pointIndex => {
            const rowOriginal = Math.floor(pointIndex / charWidth);
            const widthNew = charWidth + margin * 2;
            const baseOffsetY = widthNew * margin + margin;
            const thisRowOffsetY = baseOffsetY + rowOriginal * margin * 2;
            return (pointIndex += thisRowOffsetY);
          }),
        ];
      }
    })
  );
}
