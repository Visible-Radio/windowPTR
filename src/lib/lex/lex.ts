export class Text {
  protected __text: string;
  constructor(text: string) {
    this.__text = text;
  }

  get text() {
    return this.__text;
  }
}

export class Tag {
  protected __tag: string;
  constructor(tag: string) {
    this.__tag = tag;
  }

  get tag() {
    return this.__tag;
  }
}

export function lex(document: string) {
  /** string being built. periodically gets dumped to out when entering or closing a tag. */
  let text = "";
  const out = [];
  /** whether or not the current character is between a pair of angle brackets  */
  let inTag = false;
  for (const char of document) {
    if (char === "\n") console.log("newline");
    if (char === "<") {
      inTag = true;
      if (text) {
        out.push(new Text(text));
        text = "";
      }
    } else if (char === ">") {
      inTag = false;
      out.push(new Tag(text));
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
