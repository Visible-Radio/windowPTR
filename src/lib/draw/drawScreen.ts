import { gridPositionFromIndex } from "../../utils/gridPositionFromIndex";
import { rgbToString } from "../../utils/rgbToString";
import { SimpleLayoutObject } from "../layout/layoutByCharacter";
import { store } from "../state/state";
import { invertChar } from "./invertChar";
import { applyOutline } from "./outlineChar";

export function drawScreen(layoutList: SimpleLayoutObject[]) {
  const { getTools, charDefs, dm, scrollY_du } = store.getState();
  const { ctx, fillRect_du, clearRect_du } = getTools(dm.scale);
  ctx.fillStyle = rgbToString(dm.borderColor);

  clearRect_du(
    dm.drawAreaLeft_du,
    dm.drawAreaTop_du - 2,
    dm.drawAreaRight_du,
    dm.drawAreaHeight_du + 3
  );

  for (let i = 0; i < layoutList.length; i++) {
    const { x: cursorX_du, y: cursorY_du, char, attributes } = layoutList[i];
    if (
      cursorY_du > scrollY_du + dm.drawAreaBottom_du ||
      cursorY_du + dm.cellHeight_du < scrollY_du
    ) {
      continue;
    }

    const c = char.toUpperCase() in charDefs ? char.toUpperCase() : " ";

    const current = attributes?.highlight
      ? invertChar(charDefs[c], charDefs.charWidth)
      : attributes?.outline
      ? applyOutline(
          charDefs[c],
          charDefs.charWidth,
          determineOutline(layoutList, i)
        )
      : charDefs[c];

    ctx.fillStyle = attributes?.color ?? rgbToString(dm.borderColor);

    current.forEach((point: number) => {
      const { x, y } = gridPositionFromIndex({
        index: point,
        columns: dm.cellWidth_du,
      });

      const adjustedX = x + cursorX_du;
      const adjustedY = y + cursorY_du - scrollY_du;

      if (
        !(
          dm.drawAreaBottom_du < adjustedY ||
          adjustedY < dm.drawAreaTop_du - 2 ||
          adjustedX > dm.drawAreaRight_du + 2
        )
      ) {
        // prevent drawing pixels in gutters
        fillRect_du(adjustedX, adjustedY, 1, 1);
      }
    });
  }
}
/*
 !(
  dm.drawAreaBottom_du - 1 < adjustedY ||
  adjustedY < dm.drawAreaTop_du ||
  adjustedX > dm.drawAreaRight_du + 1
)
*/
function determineOutline(
  layoutList: SimpleLayoutObject[],
  i: number
): "start" | "middle" | "end" | null {
  const prev = layoutList[i - 1];
  const next = layoutList[i + 1];

  if (!prev.attributes?.outline) {
    return "start";
  }
  if (prev.attributes?.outline && next?.attributes?.outline) {
    return "middle";
  }
  if (!next.attributes?.outline) {
    return "end";
  }
  return null;
}
