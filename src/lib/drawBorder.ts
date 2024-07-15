import { rgbToString } from '../utils/rgbToString';
import { TDisplayMetrics } from '../utils/typeUtils/configuredCanvas';

import { useDrawingTools } from './makeDrawingTools';

export default function drawBorder(
  getTools: ReturnType<typeof useDrawingTools>,
  dm: TDisplayMetrics
) {
  const {
    borderColor,
    borderWidth_du,
    scale,
    displayHeight_du,
    displayWidth_du,
  } = dm;
  if (borderWidth_du < 1) return;
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
