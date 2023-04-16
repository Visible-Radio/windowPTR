import { Element, Text, parseTag } from "../parse/parser";

export function lex(document: string) {
  /** string being built. periodically gets dumped to out when entering or closing a tag. */
  let text = "";
  const out = [];
  /** whether or not the current character is between a pair of angle brackets  */
  let inTag = false;
  for (const char of document) {
    if (char === "<") {
      inTag = true;
      if (text) {
        out.push(new Text(text));
        text = "";
      }
    } else if (char === ">") {
      inTag = false;
      const [tagName, attributes] = parseTag(text);
      out.push(new Element(tagName, attributes));
      text = "";
    } else {
      text += char;
    }
  }
  if (!inTag && text) {
    out.push(new Text(text));
  }
  return out;
}
