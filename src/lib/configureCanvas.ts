import { DisplayMetrics } from "../utils/typeUtils/configuredCanvas.js";
import makeDu from "./makeDu.js";

/**
 * @returns metrics about the canvas display, the canvas 2D context, and the display metrics
 */
export default function configureCanvas(
  canvas: HTMLCanvasElement,
  dm: DisplayMetrics
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas context");

  ctx.canvas.width = dm.displayWidth_px;
  ctx.canvas.height = dm.displayHeight_px;

  const dU = makeDu(dm.scale);
  const withDu =
    <T, U extends number[]>(fn: (...callWithArgs: U) => T) =>
    (...callWithArgs: U): T => {
      const inDisplayUnits = dU(...callWithArgs);
      return fn.call(ctx, ...(inDisplayUnits as U));
    };

  return {
    ctx,
    canvas,
    dm,

    /**
     * @remarks inputs are adjusted by the current scale value
     */
    moveTo_du(...args: Parameters<typeof ctx.moveTo>) {
      return withDu(ctx.moveTo)(...args);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    lineTo_du(...args: Parameters<typeof ctx.lineTo>) {
      return withDu(ctx.lineTo)(...args);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    drawRect_du(...args: Parameters<typeof ctx.rect>) {
      return withDu(ctx.rect)(...args);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    fillRect_du(...args: Parameters<typeof ctx.fillRect>) {
      return withDu(ctx.fillRect)(...args);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    strokeRect_du(...args: Parameters<typeof ctx.strokeRect>) {
      return withDu(ctx.strokeRect)(...args);
    },
    /**
     * @remarks inputs are adjusted by the current scale value
     */
    clearRect_du(...args: Parameters<typeof ctx.clearRect>) {
      return withDu(ctx.clearRect)(...args);
    },
  };
}
