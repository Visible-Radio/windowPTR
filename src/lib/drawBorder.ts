import { DisplayMetrics } from "../utils/typeUtils/configuredCanvas";
import { rgbToString } from "./init";
import { useDrawingTools } from "./makeDrawingTools";

export default function drawBorder(
  getTools: ReturnType<typeof useDrawingTools>,
  dm: DisplayMetrics
) {
  const {
    borderColor,
    borderWidth_du,
    scale,
    displayHeight_du,
    displayWidth_du,
  } = dm;
  const { strokeRect_du, ctx } = getTools(scale);

  ctx.strokeStyle = rgbToString(borderColor);
  ctx.lineWidth = borderWidth_du * scale;

  strokeRect_du(
    borderWidth_du / 2,
    borderWidth_du / 2,
    displayWidth_du - borderWidth_du,
    displayHeight_du - borderWidth_du
  );

  return { ctx, dm };
}
