import { gridPositionFromIndex } from "../../utils/gridPositionFromIndex";
import { rgbToString } from "../../utils/rgbToString";
import { DisplayMetrics } from "../../utils/typeUtils/configuredCanvas";
import drawCellOutlines from "../drawCellOutlines";
import { SimpleLayoutObject } from "../layout/layoutByCharacter";
import { useDrawingTools } from "../makeDrawingTools";
import { AttributeMap } from "../parse/parser";
import { createPtrGlobalStore } from "../state/state";
import { invertChar } from "./invertChar";
import { applyOutline } from "./outlineChar";

function clearScreen(
  dm: DisplayMetrics,
  clearRect_du: ReturnType<ReturnType<typeof useDrawingTools>>["clearRect_du"]
) {
  clearRect_du(
    dm.drawAreaLeft_du,
    dm.drawAreaTop_du - 2,
    dm.drawAreaRight_du,
    dm.drawAreaHeight_du + 3
  );
}

export function createDrawScreen(
  store: ReturnType<typeof createPtrGlobalStore>
) {
  /** Return a new layout list containing only onscreen characters */
  function getOnScreen(
    layoutList: SimpleLayoutObject[],
    dm: DisplayMetrics
  ): SimpleLayoutObject[] {
    return layoutList.filter(layoutObject => {
      const { y: cursorY_du } = layoutObject;
      const { scrollY_du } = store.getState();
      return !(
        cursorY_du > scrollY_du + dm.drawAreaBottom_du ||
        cursorY_du + dm.cellHeight_du < scrollY_du
      );
    });
  }

  // write a function that transforms a collection of pixels at a specified charwidth
  // it will need all the points, and the charwidth
  // we should also pass a color with each point.

  function applyTransform(
    points: { point1D: number; color: string }[],
    cellWidth_du: number,
    targetWidth_du: number
  ) {
    const transformed: typeof points = points.map(point => {
      const { x, y } = gridPositionFromIndex({
        index: point.point1D,
        columns: cellWidth_du,
      });
      return {
        ...point,
        point1D: x + y * targetWidth_du,
      };
    });

    return transformed;
  }

  return async function drawScreen(
    layoutList: SimpleLayoutObject[],
    noAnimate: boolean
  ) {
    const { getTools, charDefs, dm } = store.getState();
    const onScreen = getOnScreen(layoutList, dm);
    const { ctx, clearRect_du } = getTools(dm.scale);
    ctx.fillStyle = rgbToString(dm.borderColor);
    clearScreen(dm, clearRect_du);

    // need to draw each character
    // for each character, we need to draw each intermediary state
    if (noAnimate) {
      for (let i = 0; i < onScreen.length; i++) {
        const layoutObject = onScreen[i];
        layoutObject.isNew = false;
        const { x: cursorX_du, y: cursorY_du, char, attributes } = layoutObject;
        const c = char.toUpperCase() in charDefs ? char.toUpperCase() : " ";
        const coloredCharPoints = getColoredCharPoints(c, attributes);
        const coloredOutlinePoints = getColoredOutlinePoints(
          layoutList,
          i,
          attributes
        );

        drawPoints(
          [...coloredCharPoints, ...coloredOutlinePoints],
          cursorX_du,
          cursorY_du
        );
      }
      return;
    }

    for (let i = 0; i < onScreen.length; i++) {
      setTimeout(() => {
        const layoutObject = onScreen[i];
        layoutObject.isNew = false;
        const { x: cursorX_du, y: cursorY_du, char, attributes } = layoutObject;
        const c = char.toUpperCase() in charDefs ? char.toUpperCase() : " ";
        const coloredCharPoints = getColoredCharPoints(c, attributes);
        const coloredOutlinePoints = getColoredOutlinePoints(
          layoutList,
          i,
          attributes
        );

        for (let j = 0; j < dm.cellWidth_du + 1; j += 1) {
          setTimeout(() => {
            clearRect_du(
              cursorX_du,
              cursorY_du,
              cursorX_du + dm.cellWidth_du,
              cursorY_du + dm.cellWidth_du
            );

            drawPoints(
              [
                ...applyTransform(coloredCharPoints, dm.cellWidth_du, j),
                ...coloredOutlinePoints,
              ],
              cursorX_du,
              cursorY_du
            );
          }, 16 * j + 16 * i);
        }
      }, 16 * i);
    }
  };

  function getColoredCharPoints(
    char: string,
    attributes: AttributeMap | undefined
  ) {
    const { charDefs, dm } = store.getState();
    const color = attributes?.color ?? rgbToString(dm.borderColor);
    return (
      attributes?.highlight
        ? invertChar(charDefs[char], charDefs.charWidth)
        : (charDefs[char] as number[])
    ).map((point1D: number) => ({ point1D, color }));
  }

  function getColoredOutlinePoints(
    layoutList: SimpleLayoutObject[],
    index: number,
    attributes: AttributeMap | undefined
  ) {
    const { charDefs, dm } = store.getState();
    return attributes?.outline
      ? applyOutline(
          [],
          charDefs.charWidth,
          determineOutline(layoutList, index)
        ).map((point1D: number) => ({
          point1D,
          color:
            typeof attributes?.outline === "string"
              ? attributes?.outline
              : rgbToString(dm.borderColor),
        }))
      : [];
  }

  function drawPoints(
    points: { point1D: number; color: string }[],
    cursorX_du: number,
    cursorY_du: number
  ): void {
    const { getTools, dm, scrollY_du } = store.getState();
    const { fillRect_du, ctx } = getTools(dm.scale);

    points.forEach(({ point1D, color }) => {
      ctx.fillStyle = color;
      const { x, y } = gridPositionFromIndex({
        index: point1D,
        columns: dm.cellWidth_du,
      });

      const adjustedX = x + cursorX_du;
      const adjustedY = y + cursorY_du - scrollY_du;

      if (
        !(
          dm.drawAreaBottom_du < adjustedY ||
          adjustedY < dm.drawAreaTop_du - 2 ||
          adjustedX > dm.drawAreaRight_du + 2
        )
      ) {
        // prevent drawing pixels in gutters
        fillRect_du(adjustedX, adjustedY, 1, 1);
      }
    });
  }

  function determineOutline(
    layoutList: SimpleLayoutObject[],
    i: number
  ): "start" | "middle" | "end" | null {
    const prev = layoutList[i - 1];
    const next = layoutList[i + 1];

    if (!prev?.attributes?.outline) {
      return "start";
    }
    if (prev?.attributes?.outline && next?.attributes?.outline) {
      return "middle";
    }
    if (!next?.attributes?.outline) {
      return "end";
    }
    return null;
  }
}
