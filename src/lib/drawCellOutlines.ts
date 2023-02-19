import { DisplayMetrics } from "../utils/typeUtils/configuredCanvas";
import { useDrawingTools } from "./makeDrawingTools";

export default function drawCellOutlines(
  getTools: ReturnType<typeof useDrawingTools>,
  dm: DisplayMetrics
) {
  const {
    drawAreaLeft_du,
    drawAreaTop_du,
    cellWidth_du,
    cellHeight_du,
    gridSpaceY_du,
    gridSpaceX_du,
    displayColumns,
    displayRows,
    scale,
  } = dm;

  const { strokeRect_du, ctx } = getTools(scale);

  ctx.lineWidth = 1;

  for (let row = 0; row < displayRows; row++) {
    for (let col = 0; col < displayColumns; col++) {
      strokeRect_du(
        drawAreaLeft_du + cellWidth_du * col + gridSpaceX_du * col,
        drawAreaTop_du + cellHeight_du * row + gridSpaceY_du * row,
        cellWidth_du,
        cellHeight_du
      );
    }
  }
  return { ctx, dm };
}
