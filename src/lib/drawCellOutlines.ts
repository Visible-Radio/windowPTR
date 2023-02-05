import configureCanvas from "./configureCanvas";

export default function drawCellOutlines(
  canvasBundle: ReturnType<typeof configureCanvas>
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
  } = canvasBundle.dm;

  const { ctx, strokeRect_du } = canvasBundle;

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
  return canvasBundle;
}
