import makeDu from "./makeDu";

/**
 *
 * @returns a memoized version of makeDrawingTools()
 */
export function useDrawingTools(ctx: CanvasRenderingContext2D) {
  let lastCtx: CanvasRenderingContext2D | undefined = undefined;
  let lastScale: number | undefined = undefined;
  let lastResult: ReturnType<typeof makeDrawingTools> | undefined = undefined;

  return (scale: number) => {
    if (lastCtx === ctx && lastScale === scale && lastResult) {
      return lastResult;
    }

    const result = makeDrawingTools(ctx, scale);
    lastCtx = ctx;
    lastScale = scale;
    lastResult = result;

    return result;
  };
}

export default function makeDrawingTools(
  ctx: CanvasRenderingContext2D,
  scale: number
) {
  const dU = makeDu(scale);
  const withDu =
    <T, U extends number[]>(fn: (...callWithArgs: U) => T) =>
    (...callWithArgs: U): T => {
      const inDisplayUnits = dU(...callWithArgs);
      return fn.call(ctx, ...(inDisplayUnits as U));
    };

  return {
    ctx,
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
