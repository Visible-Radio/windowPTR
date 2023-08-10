import { traverseReduce } from "../../utils/traverseReduce";

export type AttributeMap = {
  highlight?: boolean;
  color?: `rgb(${number},${number},${number})` | null;
  outline?: boolean | `rgb(${number},${number},${number})`;
};

const AttributeNamesArr = ["highlight", "color", "outline"] as const;

export class Text {
  protected __text: string;
  protected __parent: Element;
  protected __children: never[];
  constructor(text: string, parent: Element /* attributes?: AttributeMap */) {
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
    return `${this.__text}`.trim();
  }
  get nextSibling(): Node | undefined {
    if (this.parent) {
      const thisIndex = this.parent.children.findIndex(node => node === this);
      const sibling: Node | undefined = this.parent.children[thisIndex + 1];
      return sibling;
    }
    return undefined;
  }
  get ancestorAttributes(): AttributeMap {
    return getAncestorAttributes(this, {});
  }
}

function getAncestorAttributes(node: Node, attrs: AttributeMap): AttributeMap {
  if (!node.parent) {
    return attrs;
  }
  return getAncestorAttributes(
    node.parent,
    node instanceof Element ? { ...node.attributes, ...attrs } : attrs
  );
}
export class Element {
  protected __tagName: string;
  protected __attributes: Partial<AttributeMap>;
  protected __parent: Element;
  protected __children: Node[];
  constructor(
    tagName: string,
    parent: Element,
    attributes: Partial<AttributeMap>
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
    return `<${this.__tagName} ${Object.entries(this.__attributes)
      .map(([attrName, attrValue]) => `${attrName}=${attrValue}`)
      .join(" ")}>`.trim();
  }
  get nextSibling(): Node | undefined {
    if (this.parent) {
      const thisIndex = this.parent.children.findIndex(node => node === this);
      const sibling: Node | undefined = this.parent.children[thisIndex + 1];
      return sibling;
    }
    return undefined;
  }
}

export type Node = Element | Text;

/** Process the markup source and build a document tree from it */
export function parse(document: string) {
  /** string being built. periodically gets dumped to out when entering or closing a tag. */
  let text = "";
  const unfinished: Element[] = [];
  /** whether or not the current character is between a pair of angle brackets  */
  let inTag = false;
  for (const char of document.trim()) {
    if (char === "<") {
      inTag = true;
      if (text) {
        addText(unfinished, text.trim());
        text = "";
      }
    } else if (char === ">") {
      inTag = false;
      /* always add a root element*/
      if (unfinished.length === 0 && text !== "root") {
        addTag(unfinished, "root");
      }
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
  return ret;
}

/** Add a text node to the parent element's array of children. Mutates the passed-in array */
export function addText(unfinishedNodeArray: Element[], text: string) {
  if (text.trim().length === 0) return;
  const parent = unfinishedNodeArray.at(-1);
  if (parent) {
    const node = new Text(text, parent /* parent.attributes */);
    parent.children.push(node);
  } else {
    addTag(unfinishedNodeArray, "root");
    addText(unfinishedNodeArray, text);
  }
}

/** Add an Element node to the end of the unfinished node array, or if encountering a closing tag, add the Element to the parent's array of children. Mutates the passed-in array */
export function addTag(unfinishedNodeArray: Element[], tag: string) {
  if (tag.startsWith("/")) {
    /* closing tag closes the unfinished node stting at the end of the list */
    if (unfinishedNodeArray.length === 1) return;
    const node = unfinishedNodeArray.pop();
    const parent = unfinishedNodeArray.at(-1);
    if (node) {
      parent?.children.push(node);
    }
  } else {
    /* opening tag adds an Element to the unfinished node array */
    const [tagName, attributes] = parseTag(tag);
    const parent = unfinishedNodeArray.at(-1);
    const node = new Element(tagName, parent as Element, attributes);
    unfinishedNodeArray.push(node);
  }
}

/** Mutates the passed-in array */
export function finish(unfinishedNodeArray: Element[]) {
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
  return unfinishedNodeArray.pop()!;
}

export function parseTag(text: string): [string, AttributeMap] {
  const [tagName, ...mabyeAttributes] = text.split(" ");
  const attributes = mabyeAttributes.reduce((acc: AttributeMap, maybe) => {
    const [attributeName, attributeValue] = maybe.split("=");
    if (isAttributeName(attributeName)) {
      // @ts-expect-error can't be arsed to do this validation right now.
      acc[attributeName] = coerceStringsToTypes(
        attributeValue
      ) as AttributeMap[typeof attributeName];
    }
    return acc;
  }, {});
  return [tagName, attributes];
}

function isAttributeName(name: string): name is keyof AttributeMap {
  return AttributeNamesArr.includes(name as keyof AttributeMap);
}

export function printTree(node: Node): string {
  const result = traverseReduce(
    node,
    (acc: { out: string }, n: Node, _, depth) => {
      acc.out = acc.out + "\n" + " ".repeat(depth * 2) + n.toString();
      return acc;
    },
    { out: "" }
  ).out;

  return result;
}

/** Catches strings representing booleans and converts them - otherwise returns the string */
function coerceStringsToTypes(string: string) {
  switch (string) {
    case "true":
      return true;
    case "false":
      return false;
    case "null":
      return null;
    default:
      return string;
  }
}
