// may need to move this to prevent import cycles
export type AttributeMap = {
  highlight?: boolean;
  color?: `rgb(${number},${number},${number})` | null;
  outline?: boolean;
};

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
  protected __tagName: string;
  protected __attributes: Partial<AttributeMap>;
  constructor(tagName: string, attributes: Partial<AttributeMap>) {
    this.__tagName = tagName;
    this.__attributes = attributes;
  }

  get tag() {
    return this.__tagName;
  }
  get attributes() {
    return this.__attributes;
  }
}

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
      out.push(new Tag(tagName, attributes));
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

/** take the content between < and /> and split it into the tag name, and any attributes */
function parseTag(text: string) {
  const [tagName, ...mabyeAttributes] = text.split(" ");
  const attributes = mabyeAttributes.map(maybe => {
    // should do some validation that we're not passing junk
    const [attributeName, attributeValue] = maybe.split("=");
    return [attributeName, coerceBooleans(attributeValue)];
  });
  return [tagName, Object.fromEntries(attributes)];
}

/** Catches strings representing booleans and converts them - otherwise returns the string */
function coerceBooleans(string: string) {
  switch (string) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return string;
  }
}
