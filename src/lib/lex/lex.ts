import { traverseReduce } from "../../utils/traverseReduce";

// may need to move this to prevent import cycles
export type AttributeMap = {
  highlight?: boolean;
  color?: `rgb(${number},${number},${number})` | null;
  outline?: boolean;
};

export class Text {
  protected __text: string;
  protected __parent: Element;
  protected __children: never[];
  constructor(text: string, parent: Element) {
    this.__text = text;
    this.__parent = parent;
    this.__children = []; // Text Node won't ever have children
  }

  get text() {
    return this.__text;
  }

  get parent() {
    return this.__parent;
  }

  get children() {
    return this.__children;
  }
  toString() {
    return `${this.__text}`;
  }
}

export class Element {
  protected __tagName: string;
  protected __attributes: Partial<AttributeMap>;
  protected __parent: Element;
  protected __children: Node[];
  constructor(
    tagName: string,
    attributes: Partial<AttributeMap>,
    parent: Element
  ) {
    this.__tagName = tagName;
    this.__attributes = attributes;
    this.__parent = parent;
    this.__children = [];
  }

  get tag() {
    return this.__tagName;
  }
  get attributes() {
    return this.__attributes;
  }
  get parent() {
    return this.__parent;
  }
  get children() {
    return this.__children;
  }
  toString() {
    return `<${this.__tagName}>`;
  }
}

export type Node = Element | Text;

// export class Parser {
//   protected __body: string;
//   protected __unfinished: [];
//   constructor(body: string) {
//     this.__body = body;
//     this.__unfinished = [];
//   }
// }

/** Process the markup source and build a document tree from it */
export function parse(document: string) {
  /** string being built. periodically gets dumped to out when entering or closing a tag. */
  let text = "";
  const unfinished: Node[] = [];
  /** whether or not the current character is between a pair of angle brackets  */
  let inTag = false;
  for (const char of document) {
    if (char === "<") {
      inTag = true;
      if (text) {
        addText(unfinished, text);
        text = "";
      }
    } else if (char === ">") {
      inTag = false;
      addTag(unfinished, text);
      text = "";
    } else {
      text += char;
    }
  }
  if (!inTag && text) {
    addText(unfinished, text);
  }
  const ret = finish(unfinished);
  console.log(ret);
  return ret;
}

/** Add a text node to the parent element's array of children. Mutates the passed-in array */
export function addText(unfinishedNodeArray: Node[], text: string) {
  const parent = unfinishedNodeArray.at(-1);
  if (parent && parent instanceof Element) {
    const node = new Text(text, parent);
    parent.children.push(node);
  }
}

/** Add an Element node to the end of the unfinished node array, or if encountering a closing tag, add the Element to the parent's array of children. Mutates the passed-in array */
export function addTag(unfinishedNodeArray: Node[], tag: string) {
  if (tag.startsWith("/")) {
    /* closing tag closes the unfinished node stting at the end of the list */
    if (unfinishedNodeArray.length === 1) return;
    const node = unfinishedNodeArray.pop();
    const parent = unfinishedNodeArray.at(-1);
    if (node && parent instanceof Element) {
      parent?.children.push(node);
    }
  } else {
    /* opening tag adds an Element to the unfinished node array */
    const parent = unfinishedNodeArray.at(-1);
    // if (parent instanceof Element) {
    const node = new Element(tag, {}, parent as Element);
    unfinishedNodeArray.push(node);
    // }
  }
}

/** Mutates the passed-in array */
export function finish(unfinishedNodeArray: Node[]) {
  if (unfinishedNodeArray.length === 0) {
    addTag(unfinishedNodeArray, "root");
  }
  while (unfinishedNodeArray.length > 1) {
    const node = unfinishedNodeArray.pop();
    const parent = unfinishedNodeArray.at(-1);
    if (node && parent instanceof Element) {
      parent?.children.push(node);
    }
  }
  return unfinishedNodeArray.pop();
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

function printTree(node: Node): string {
  const result = traverseReduce(
    node,
    (acc: { out: string }, n: Node, _, depth) => {
      acc.out = acc.out + "\n" + " ".repeat(depth * 2) + n.toString();
      return acc;
    },
    { out: "" }
  ).out;
  console.log(result);
  return result;
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

window._PTR.parse = parse;
window._PTR.printTree = printTree;
