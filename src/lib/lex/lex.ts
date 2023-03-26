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
  protected __attributes: Record<string, string>[];
  constructor(tagName: string, attributes: Record<string, string>[]) {
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
      console.log(tagName, attributes);
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

type TagNames = "span";
type TagAttributes = "highlight" | "color";

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
