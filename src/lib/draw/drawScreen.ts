import { gridPositionFromIndex } from "../../utils/gridPositionFromIndex";
import { rgbToString } from "../../utils/rgbToString";
import { SimpleLayoutObject } from "../layout/layoutByCharacter";
import { store } from "../state/state";

export function drawScreen(layoutList: SimpleLayoutObject[]) {
  const { getTools, charDefs, dm, scrollY_du } = store.getState();
  const { ctx, fillRect_du, clearRect_du } = getTools(dm.scale);
  ctx.fillStyle = rgbToString(dm.borderColor);
  ctx.lineWidth = dm.scale;
  clearRect_du(
    dm.drawAreaLeft_du,
    dm.drawAreaTop_du,
    dm.drawAreaRight_du,
    dm.drawAreaHeight_du
  );

  for (const { x: cursorX_du, y: cursorY_du, char } of layoutList) {
    if (
      cursorY_du > scrollY_du + dm.drawAreaHeight_du ||
      cursorY_du + dm.cellHeight_du - 4 < scrollY_du
    ) {
      /*
      TODO: Remove the "magic number" in this check
       */
      continue;
    }

    const c = char.toUpperCase() in charDefs ? char.toUpperCase() : " ";

    charDefs[c].forEach((point: number) => {
      const { x, y } = gridPositionFromIndex({
        index: point,
        columns: dm.cellWidth_du,
      });
      const adjustedX = x + cursorX_du;
      const adjustedY = y + cursorY_du - scrollY_du;

      if (
        !(adjustedY >= dm.drawAreaBottom_du || adjustedY < dm.drawAreaTop_du)
      ) {
        // prevent drawing pixels in top and bottom gutters
        fillRect_du(adjustedX, adjustedY, 1, 1);
      }
    });
  }
}
