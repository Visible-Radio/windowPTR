import makeDu from './makeDu';

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
