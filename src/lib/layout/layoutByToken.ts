import { DisplayMetrics } from "../../utils/typeUtils/configuredCanvas";
import { Tag, Text } from "../lex/lex";
import { layoutByCharacter } from "./layoutByCharacter";

export interface layoutByTokenArgs {
  tokens: (Text | Tag)[];
  dm: DisplayMetrics;
}

/** Takes a list of Tag and Text objects */
export function layoutByToken({ tokens, dm }: layoutByTokenArgs) {
  const layoutList = [];
  const xStep = dm.cellWidth_du + dm.gridSpaceX_du;
  const yStep = dm.cellHeight_du + dm.gridSpaceY_du;
  let cursorX_du = dm.drawAreaLeft_du;
  let cursorY_du = dm.drawAreaTop_du;
  const tokenFlags = { hl: false };

  for (const token of tokens) {
    setTokenFlags(token, tokenFlags);

    if (token instanceof Text) {
      const words = token.text.split(" ");
      for (const [i, word] of words.entries()) {
        if (word.length === 0) continue;
        if (
          /* jump to start of next line if there isn't room in current row for the word */
          !dm.textFits(word, cursorX_du) &&
          cursorX_du !== dm.drawAreaLeft_du
        ) {
          cursorX_du = dm.drawAreaLeft_du;
          cursorY_du += yStep;
        }

        // there is either now enough room, or the word will never fit on a single line:
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
        partialDisplayList.forEach(entry =>
          layoutList.push({ ...entry, flags: { ...tokenFlags } })
        );

        cursorX_du = newX;
        cursorY_du = newY;

        const notLineStart = cursorX_du !== dm.drawAreaLeft_du;
        if (notLineStart) {
          layoutList.push({
            x: cursorX_du,
            y: cursorY_du,
            char: " ",
            flags: i === words.length - 1 ? {} : { ...tokenFlags },
          });
          cursorX_du += xStep;
        }
      }
    }
  }
  return layoutList;
}

interface TokenFlags {
  hl: boolean;
}

/** Mutates token flags object based on the given Tag token. */
function setTokenFlags(token: Tag | Text, tokenFlags: TokenFlags) {
  if (!(token instanceof Tag)) return tokenFlags;

  switch (token.tag) {
    case "hl":
      tokenFlags.hl = true;
      return;

    case "/hl":
      tokenFlags.hl = false;
      return;

    default:
      return;
  }
}
