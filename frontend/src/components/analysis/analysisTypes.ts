import { TreeNodeDatum } from "react-d3-tree";

export interface ContractAnalysis {
  dependencies: string[];
  conditions: string[];
  treeData: TreeNodeDatum;
}

export enum AnalysisView {
  SyntaxTree = "SyntaxTree",
  Dependencies = "Dependencies",
  Conditions = "Conditions",
}
