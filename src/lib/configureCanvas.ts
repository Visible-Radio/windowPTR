import { DisplayMetrics } from "../utils/typeUtils/configuredCanvas.js";

/**
 * @returns the passed-in canvas context and display metrics
 */
export default function configureCanvas(
  ctx: CanvasRenderingContext2D,
  dm: DisplayMetrics
) {
  ctx.canvas.width = dm.displayWidth_px;
  ctx.canvas.height = dm.displayHeight_px;

  return {
    ctx,
    dm,
  };
}
