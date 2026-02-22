import Parser, { SyntaxNode } from "web-tree-sitter";
import { syntaxNodeToD3 } from "./treeToD3";
import type { TreeNodeDatum } from "react-d3-tree";

let didInit = false;

async function initTreeSitter() {
  if (!didInit) {
    await Parser.init({
      locateFile() {
        return "/tree-sitter.wasm";
      },
    });
    didInit = true;
  }
}

let pythonParser: Parser | null = null;
let haskellParser: Parser | null = null;
let aikenParser: Parser | null = null;

async function fetchWasmAndLoadLanguage(wasmPath: string): Promise<Parser.Language> {
  return Parser.Language.load(wasmPath);
}

async function getPythonParser(): Promise<Parser> {
  if (pythonParser) return pythonParser;
  await initTreeSitter();
  const parser = new Parser();
  const lang = await fetchWasmAndLoadLanguage("/grammars/tree-sitter-python.wasm");
  parser.setLanguage(lang);
  pythonParser = parser;
  return parser;
}

async function getHaskellParser(): Promise<Parser> {
  if (haskellParser) return haskellParser;
  await initTreeSitter();
  const parser = new Parser();
  const lang = await fetchWasmAndLoadLanguage("/grammars/tree-sitter-haskell.wasm");
  parser.setLanguage(lang);
  haskellParser = parser;
  return parser;
}

async function getAikenParser(): Promise<Parser> {
  if (aikenParser) return aikenParser;
  await initTreeSitter();
  const parser = new Parser();
  const lang = await fetchWasmAndLoadLanguage("/grammars/tree-sitter-aiken.wasm");
  parser.setLanguage(lang);
  aikenParser = parser;
  return parser;
}

export interface ContractAnalysis {
  dependencies: string[];
  conditions: string[];
  treeData: TreeNodeDatum;
}

function gatherPythonInfo(root: SyntaxNode): ContractAnalysis {
  const dependencies = new Set<string>();
  const conditions: string[] = [];
  let currentFunc: string | null = null;
  const knownFuncs = new Set<string>();
  const callGraph: Record<string, Set<string>> = {};

  function walk(node: SyntaxNode) {
    switch (node.type) {
      case "import_statement":
      case "import_from_statement":
        dependencies.add(node.text.trim());
        break;
      case "function_definition": {
        const nameNode = node.childForFieldName("name");
        if (nameNode) {
          currentFunc = nameNode.text;
          knownFuncs.add(currentFunc);
          callGraph[currentFunc] = callGraph[currentFunc] || new Set();
        }
        break;
      }
      case "if_statement":
      case "while_statement":
      case "assert_statement": {
        const condNode = node.childForFieldName("condition");
        if (condNode) conditions.push(condNode.text);
        break;
      }
      case "call": {
        if (currentFunc) {
          const calleeNode = node.childForFieldName("function");
          if (calleeNode && knownFuncs.has(calleeNode.text) && calleeNode.text !== currentFunc) {
            callGraph[currentFunc].add(calleeNode.text);
          }
        }
        break;
      }
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) walk(child);
    }
  }
  walk(root);
  return { dependencies: Array.from(dependencies), conditions, treeData: syntaxNodeToD3(root) };
}

function gatherHaskellInfo(root: SyntaxNode): ContractAnalysis {
  const dependencies = new Set<string>();
  const conditions: string[] = [];
  let currentFunc: string | null = null;
  const knownFuncs = new Set<string>();
  const callGraph: Record<string, Set<string>> = {};

  function walk(node: SyntaxNode) {
    switch (node.type) {
      case "import":
        dependencies.add(node.text);
        break;
      case "function":
      case "bind": {
        const nameNode = node.child(0);
        if (nameNode) {
          currentFunc = nameNode.text;
          knownFuncs.add(currentFunc);
          callGraph[currentFunc] = callGraph[currentFunc] || new Set();
        }
        break;
      }
      case "conditional":
      case "if_expression":
      case "guard": {
        const condNode = node.child(0);
        if (condNode) conditions.push(condNode.text);
        break;
      }
      case "apply":
      case "infix": {
        if (currentFunc) {
          const calleeNode = node.child(0);
          if (calleeNode && knownFuncs.has(calleeNode.text) && calleeNode.text !== currentFunc) {
            callGraph[currentFunc].add(calleeNode.text);
          }
        }
        break;
      }
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) walk(child);
    }
  }
  walk(root);
  return { dependencies: Array.from(dependencies), conditions, treeData: syntaxNodeToD3(root) };
}

function gatherAikenInfo(root: SyntaxNode): ContractAnalysis {
  const dependencies = new Set<string>();
  const conditions: string[] = [];
  let currentFunc: string | null = null;
  const knownFuncs = new Set<string>();
  const callGraph: Record<string, Set<string>> = {};

  function walk(node: SyntaxNode) {
    switch (node.type) {
      case "import":
        dependencies.add(node.text.trim());
        break;
      case "function": {
        const nameNode = node.child(1);
        if (nameNode?.type === "identifier") {
          currentFunc = nameNode.text;
          knownFuncs.add(currentFunc);
          callGraph[currentFunc] = callGraph[currentFunc] || new Set();
        }
        break;
      }
      case "validator": {
        const nameNode = node.child(1);
        if (nameNode?.type === "identifier") {
          currentFunc = `validator:${nameNode.text}`;
          knownFuncs.add(currentFunc);
          callGraph[currentFunc] = callGraph[currentFunc] || new Set();
        }
        break;
      }
      case "test": {
        const nameNode = node.child(1);
        if (nameNode?.type === "identifier") {
          currentFunc = `test:${nameNode.text}`;
          knownFuncs.add(currentFunc);
          callGraph[currentFunc] = callGraph[currentFunc] || new Set();
        }
        break;
      }
      case "if":
      case "when": {
        const condNode = node.child(1);
        if (condNode) conditions.push(condNode.text);
        break;
      }
      case "call": {
        if (currentFunc) {
          const calleeNode = node.child(0);
          if (calleeNode && knownFuncs.has(calleeNode.text) && calleeNode.text !== currentFunc) {
            callGraph[currentFunc].add(calleeNode.text);
          }
        }
        break;
      }
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) walk(child);
    }
  }
  walk(root);
  return { dependencies: Array.from(dependencies), conditions, treeData: syntaxNodeToD3(root) };
}

export async function analyzeSmartContract(
  code: string,
  fileName: string
): Promise<{ analysis: ContractAnalysis }> {
  let analysis: ContractAnalysis = {
    dependencies: [],
    conditions: [],
    treeData: {
      name: "root",
      attributes: { text: "Root Node", nodeId: "node-0" },
      children: [],
    },
  };

  if (fileName.endsWith(".py")) {
    const parser = await getPythonParser();
    const tree = parser.parse(code);
    analysis = gatherPythonInfo(tree.rootNode);
  } else if (fileName.endsWith(".hs")) {
    const parser = await getHaskellParser();
    const tree = parser.parse(code);
    analysis = gatherHaskellInfo(tree.rootNode);
  } else if (fileName.endsWith(".ak")) {
    const parser = await getAikenParser();
    const tree = parser.parse(code);
    analysis = gatherAikenInfo(tree.rootNode);
  }
  return { analysis };
}
