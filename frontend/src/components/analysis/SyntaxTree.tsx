import React from "react";
import { TreeNodeDatum } from "react-d3-tree";
import TreeVisualization from "./TreeVisualization";

interface SyntaxTreeProps {
  treeData: TreeNodeDatum;
  isDarkMode: boolean;
}

const handleNodeClick = (node: TreeNodeDatum) => {
  if (node.attributes && node.attributes.text) {
    const text = node.attributes.text as string;
    const lineMatch = text.match(/Line (\d+):/);
    if (lineMatch && lineMatch[1]) {
      const lineNumber = parseInt(lineMatch[1], 10);
      scrollToLine(lineNumber);
    }
  }
};

const scrollToLine = (lineNumber: number) => {
  const lineElement = document.getElementById(`code-line-${lineNumber}`);
  if (lineElement) {
    lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
    lineElement.classList.add("highlight");
    setTimeout(() => lineElement.classList.remove("highlight"), 2000);
  }
};

const SyntaxTree: React.FC<SyntaxTreeProps> = ({ treeData, isDarkMode }) => {
  return (
    <div className="analysis-section">
      {treeData && (
        <div className="mt-8" style={{ height: "500px" }}>
          <h3 className="font-bold text-lg mb-2">Syntax Tree:</h3>
          <TreeVisualization
            data={treeData}
            onNodeClick={handleNodeClick}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};

export default SyntaxTree;
