import { DisplayMetrics } from "../../utils/typeUtils/configuredCanvas";
import { MainStoreState } from "../state/state";
import { layoutByCharacter, SimpleLayoutObject } from "./layoutByCharacter";

export interface layoutByWordArgs {
  simpleText: MainStoreState["simpleText"];
  dm: DisplayMetrics;
}

/** A layout function that avoids breaking words unless they are wider than the entire display itself. Returns a display list */
export function layoutByWord({
  simpleText,
  dm,
}: layoutByWordArgs): SimpleLayoutObject[] {
  const words = simpleText.split(" ");
  const layoutList: SimpleLayoutObject[] = [];
  const xStep = dm.cellWidth_du + dm.gridSpaceX_du;
  const yStep = dm.cellHeight_du + dm.gridSpaceY_du;

  let cursorX_du = dm.drawAreaLeft_du;
  let cursorY_du = dm.drawAreaTop_du;

  for (const word of words) {
    // check if there is room in the line for the word

    if (!dm.textFits(word, cursorX_du) && cursorX_du !== dm.drawAreaLeft_du) {
      cursorX_du = dm.drawAreaLeft_du;
      cursorY_du += yStep;
    }

    // if there is room, or the word will never fit on a single line:
    // hand off layout of chars in word to our character by character layout function
    const {
      layoutList: partialDisplayList,
      x: newX,
      y: newY,
    } = layoutByCharacter({
      simpleText: word,
      dm,
      initialCursor: { x: cursorX_du, y: cursorY_du },
    });
    partialDisplayList.forEach(entry => layoutList.push(entry));

    cursorX_du = newX;
    cursorY_du = newY;

    if (cursorX_du !== dm.drawAreaLeft_du) {
      cursorX_du += xStep;
    }
    layoutList.push({ x: cursorX_du, y: cursorY_du, char: " " });
  }
  return layoutList;
}
