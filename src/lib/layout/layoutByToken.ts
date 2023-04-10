import { DisplayMetrics } from "../../utils/typeUtils/configuredCanvas";
import { Element, Text } from "../lex/lex";
import { layoutByCharacter } from "./layoutByCharacter";

export interface layoutByTokenArgs {
  tokens: (Text | Element)[];
  dm: DisplayMetrics;
}

/** Takes a list of Tag and Text objects */
export function layoutByToken({ tokens, dm }: layoutByTokenArgs) {
  const layoutList = [];
  const xStep = dm.cellWidth_du + dm.gridSpaceX_du;
  const yStep = dm.cellHeight_du + dm.gridSpaceY_du;
  let cursorX_du = dm.drawAreaLeft_du;
  let cursorY_du = dm.drawAreaTop_du;
  const tokenAttributes = { highlight: false, color: null, outline: false };

  for (const token of tokens) {
    setTokenAttributes(token, tokenAttributes);
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
          layoutList.push({ ...entry, attributes: { ...tokenAttributes } })
        );

        cursorX_du = newX;
        cursorY_du = newY;

        const notLineStart = cursorX_du !== dm.drawAreaLeft_du;
        if (notLineStart) {
          layoutList.push({
            x: cursorX_du,
            y: cursorY_du,
            char: " ",
            attributes: i === words.length - 1 ? {} : { ...tokenAttributes },
          });
          cursorX_du += xStep;
        }
      }
    }
  }
  return layoutList;
}

interface TokenAttributes {
  highlight: boolean;
  color: `rgb(${number},${number},${number})` | null;
  outline: boolean;
}

function setTokenAttributes(
  token: Element | Text,
  tokenAttributes: TokenAttributes
) {
  if (!(token instanceof Element)) return;

  if (token.tag === "span") {
    const { attributes } = token;
    tokenAttributes.color = attributes?.color ?? null;
    tokenAttributes.highlight = attributes?.highlight ?? false;
    tokenAttributes.outline = attributes?.outline ?? false;
  } else if (token.tag === "/span") {
    tokenAttributes.color = null;
    tokenAttributes.highlight = false;
    tokenAttributes.outline = false;
  }
  return;
}
