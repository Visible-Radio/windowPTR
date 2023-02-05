import { compose } from "./utils.js";

export function parseXML(xmlString, parser = new DOMParser()) {
  return parser.parseFromString(xmlString, "application/xml");
}

// reduce the verbose DOM tree returned by the DOM parser
export function simplifyDOM(DOM) {
  if (!DOM?.nodeName) return;
  if (DOM.nodeName === "#text") {
    // filter out text nodes that only contain whitespace
    return DOM.textContent.match(/\S/)
      ? {
          nodeName: "#text".toUpperCase(),
          textContent: DOM.textContent,
        }
      : undefined;
  } else {
    return {
      nodeName: DOM.nodeName,
      attributes: DOM.attributes
        ? simplifyAttributes(DOM.attributes)
        : undefined,
      childNodes: Array.from(DOM.childNodes)
        .map((cN, i) => simplifyDOM(cN))
        .filter(n => n !== undefined),
    };
  }
}

export function simplifyAttributes(DOMattributes) {
  return Array.from(DOMattributes).reduce((acc, { name, value }) => {
    return { ...acc, [name]: value };
  }, {});
}

// traverse again, this time installing in each child a reference to the parent
export function linkParents(DOM, parent) {
  const hasChildren = DOM?.childNodes?.length > 0;
  DOM.parent = parent;
  if (hasChildren) {
    DOM.childNodes = Array.from(DOM.childNodes).map(cN => linkParents(cN, DOM));
  }
  return DOM;
}

export function arrayFromTree(tree, list = []) {
  const hasChildren = tree?.childNodes?.length > 0;
  if (!hasChildren) {
    return [...list, tree];
  } else {
    return [
      ...list,
      tree,
      ...tree.childNodes.map(cN => arrayFromTree(cN, list)).flat(),
    ];
  }
}

export function applyNodeIds(nodeArray) {
  nodeArray.forEach((node, i) => {
    node.nodeId = i;
  });
  return nodeArray;
}

// higher order tree traversal fns
export function traverseForEach(tree, callback = () => {}, initial = tree) {
  callback(tree);
  const hasChildren = tree?.childNodes?.length > 0;
  if (!hasChildren) {
    return initial;
  } else {
    tree.childNodes.forEach(node => traverseForEach(node, callback, initial));
    return initial;
  }
}

// like reduce, but for trees
export function traverseReduce(tree, callback, acc, parent = null) {
  const newAcc = callback(acc, tree, parent);
  const hasChildren = tree?.childNodes?.length > 0;
  if (!hasChildren) {
    return newAcc;
  } else {
    return tree.childNodes.reduce((rAcc, node) => {
      return traverseReduce(node, callback, rAcc, tree);
    }, newAcc);
  }
}

export function getNodeArrayPlainText(nodeArray) {
  return nodeArray.map(n => getNodePlainText(n));
}

export function tRToArray(node) {
  return traverseReduce(node, (acc, node) => [...acc, node], []);
}

export function tRToArrayLinkParentsAddNodeIds(
  node,
  initNodeId = 0,
  initParent = null
) {
  return traverseReduce(
    node,
    (acc, node, parent) => {
      node.nodeId = acc.nodeId;
      node.parent = parent ?? initParent;
      return {
        nodeId: acc.nodeId + 1,
        nodes: [...acc.nodes, node],
      };
    },
    { nodes: [], nodeId: initNodeId, parent: initParent }
  ).nodes;
}

export function getLastNodeId(nodeArray) {
  return [...nodeArray].sort((a, b) => b.nodeId - a.nodeId)[0].nodeId;
}

export function prepareNewMessage(xmlString, initialMessages) {
  const { messages, body } = initialMessages;
  const nextId = messages.length ? getLastNodeId(messages) + 1 : 0;
  const parent = body;
  return [
    compose(
      toMessages,
      tree => {
        const newMessageNode = tree.childNodes[0].childNodes[0];
        parent.childNodes.push(newMessageNode);
        return tRToArrayLinkParentsAddNodeIds(newMessageNode, nextId, parent);
      },
      simplifyDOM
    )(parseXML(xmlString)),
    initialMessages,
  ];
}

export function toMessages(nodeArray) {
  return nodeArray.reduce(
    (acc, n) => {
      if (n.nodeName === "MESSAGE") {
        n.plainText = getNodePlainText(n);
        return { ...acc, messages: [...acc.messages, n] };
      } else if (n.nodeName === "BODY") {
        return { ...acc, body: n };
      }
      return acc;
    },
    { body: null, messages: [] }
  );
}

export function getNodePlainText(node) {
  return traverseReduce(
    node,
    (acc, node) => {
      if (node.textContent) {
        return acc + node.textContent;
      }
      return acc;
    },
    ""
  );
}

export function mergeMessages(messages) {
  const [newMessage, existingMessages] = messages;
  const merged = [...existingMessages.messages, ...newMessage.messages];
  return {
    body: existingMessages.body,
    messages: merged,
    plainText: getNodeArrayPlainText(merged),
  };
}

const initMessagesXML = `
  <BODY>
    <MESSAGE GOOD-CAR-IDEAS="none"><BL>This text should blink. </BL>This text should not. <HL>This text should be highlighted</HL></MESSAGE>
    <MESSAGE>noobs</MESSAGE>
    <MESSAGE>Hello world</MESSAGE>
  </BODY>
`;

const newMessage = `
  <BODY>
    <MESSAGE>New Message</MESSAGE>
  </BODY>
`;

const initialMessages = compose(
  toMessages,
  tRToArrayLinkParentsAddNodeIds,
  simplifyDOM
)(parseXML(initMessagesXML));

const updatedMessages = compose(
  trace,
  mergeMessages
)(prepareNewMessage(newMessage, initialMessages));
