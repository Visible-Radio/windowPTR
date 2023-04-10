export type BaseNode = {
  children: BaseNode[];
};

/**
 * @remarks callback gets accumulator, current node, parent, and recursion depth
 * @remarks array.prototype.reduce, but for trees. Calls the callback for each node the in the tree. */
export function traverseReduce<Tacc, TNode extends BaseNode>(
  node: TNode,
  callback: (acc: Tacc, n: TNode, parent: TNode | null, depth: number) => Tacc,
  acc: Tacc,
  parent: TNode | null = null,
  depth = 0
): Tacc {
  const newAcc = callback(acc, node, parent, depth);
  const hasChildren = node.children.length > 0;
  if (!hasChildren) {
    return newAcc;
  } else {
    return node.children.reduce((rAcc, n) => {
      return traverseReduce(n as TNode, callback, rAcc, node, depth + 1);
    }, newAcc);
  }
}
