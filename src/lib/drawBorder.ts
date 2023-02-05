import configureCanvas from "./configureCanvas";
import { rgbToString } from "./init";

export default function drawBorder(
  canvasBundle: ReturnType<typeof configureCanvas>
) {
  const {
    borderColor,
    borderWidth_du,
    scale,
    displayHeight_du,
    displayWidth_du,
  } = canvasBundle.dm;

  const { ctx, strokeRect_du } = canvasBundle;

  ctx.strokeStyle = rgbToString(borderColor);
  ctx.lineWidth = borderWidth_du * scale;

  strokeRect_du(
    borderWidth_du / 2,
    borderWidth_du / 2,
    displayWidth_du - borderWidth_du,
    displayHeight_du - borderWidth_du
  );

  return canvasBundle;
}
