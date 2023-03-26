import { gridPositionFromIndex } from "../../utils/gridPositionFromIndex";
import { rgbToString } from "../../utils/rgbToString";
import { SimpleLayoutObject } from "../layout/layoutByCharacter";
import { store } from "../state/state";
import { invertChar } from "./invertChar";

export function drawScreen(layoutList: SimpleLayoutObject[]) {
  const { getTools, charDefs, dm, scrollY_du } = store.getState();
  const { ctx, fillRect_du, clearRect_du } = getTools(dm.scale);
  ctx.fillStyle = rgbToString(dm.borderColor);

  clearRect_du(
    dm.drawAreaLeft_du,
    dm.drawAreaTop_du,
    dm.drawAreaRight_du,
    dm.drawAreaHeight_du
  );

  for (const { x: cursorX_du, y: cursorY_du, char, attributes } of layoutList) {
    if (
      cursorY_du > scrollY_du + dm.drawAreaBottom_du ||
      cursorY_du + dm.cellHeight_du < scrollY_du
    ) {
      continue;
    }

    const c = char.toUpperCase() in charDefs ? char.toUpperCase() : " ";

    const current = attributes.highlight
      ? invertChar(charDefs[c], charDefs.charWidth)
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
          dm.drawAreaBottom_du - 1 < adjustedY ||
          adjustedY < dm.drawAreaTop_du ||
          adjustedX > dm.drawAreaRight_du + 1
        )
      ) {
        // prevent drawing pixels in gutters
        fillRect_du(adjustedX, adjustedY, 1, 1);
      }
    });
  }
}
