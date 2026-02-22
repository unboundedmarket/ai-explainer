import { SyntaxNode } from "web-tree-sitter";
import { TreeNodeDatum } from "react-d3-tree";

let nodeIdCounter = 0;

export function syntaxNodeToD3(node: SyntaxNode): TreeNodeDatum {
  const nodeName = node.type;
  const nodeText = node.text.trim();
  const startLine = node.startPosition.row + 1;
  const nodeId = `node-${nodeIdCounter++}`;

  const treeNode: TreeNodeDatum = {
    name: nodeName,
    attributes: {
      text: nodeText ? `Line ${startLine}: ${nodeText}` : `Line ${startLine}`,
      nodeId,
    },
  };

  const children: TreeNodeDatum[] = [];
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    if (child) {
      children.push(syntaxNodeToD3(child));
    }
  }

  if (children.length > 0) {
    treeNode.children = children;
  }

  return treeNode;
}
