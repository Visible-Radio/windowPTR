import { DisplayMetrics } from "../../utils/typeUtils/configuredCanvas";
import { AttributeMap } from "../parse/parser";

import { MainStoreState } from "../state/state";

export interface layoutByCharacterArgs {
  simpleText: MainStoreState["simpleText"];
  dm: DisplayMetrics;
}
export interface layoutByCharacterWithCursorArgs {
  simpleText: MainStoreState["simpleText"];
  dm: DisplayMetrics;
  initialCursor: {
    x: number;
    y: number;
  };
}

export interface SimpleLayoutObject {
  x: number;
  y: number;
  char: string;
  attributes?: AttributeMap;
}

export interface DisplayListWithCursor {
  layoutList: SimpleLayoutObject[];
  x: number;
  y: number;
}

export function layoutByCharacter(
  input: layoutByCharacterArgs
): SimpleLayoutObject[];
export function layoutByCharacter(
  input: layoutByCharacterWithCursorArgs
): DisplayListWithCursor;

/** A character-by-character layout function that returns a display list. If provided with an initial cursor object, the layout will begin there, and will return the layout list along with the updated cursor position */
export function layoutByCharacter(
  input: layoutByCharacterArgs | layoutByCharacterWithCursorArgs
): SimpleLayoutObject[] | DisplayListWithCursor {
  const { dm, simpleText } = input;
  const layoutList = [];
  const xStep = dm.cellWidth_du + dm.gridSpaceX_du;
  const yStep = dm.cellHeight_du + dm.gridSpaceY_du;
  const lastColumnXCoord = dm.getColumnXCoord_du(dm.displayColumns - 1);

  let cursorX_du = dm.drawAreaLeft_du;
  let cursorY_du = dm.drawAreaTop_du;

  if ("initialCursor" in input) {
    cursorX_du = input.initialCursor.x;
    cursorY_du = input.initialCursor.y;
  }

  for (const char of simpleText) {
    layoutList.push({ x: cursorX_du, y: cursorY_du, char });

    if (char === "\n") {
      // jump to a new row on \n
      // this is quick and dirty. We may actually want newlines in the layoutList
      cursorX_du = dm.drawAreaLeft_du;
      cursorY_du += yStep;
      continue;
    }

    if (cursorX_du === dm.getColumnXCoord_du(0) && char === " ") {
      // omit spaces at the start of a row
      continue;
    }

    if (cursorX_du >= lastColumnXCoord) {
      cursorX_du = dm.drawAreaLeft_du;
      cursorY_du += yStep;
    } else {
      cursorX_du += xStep;
    }
  }

  if ("initialCursor" in input) {
    return { layoutList, x: cursorX_du, y: cursorY_du };
  } else {
    return layoutList;
  }
}
