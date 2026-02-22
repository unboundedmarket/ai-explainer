import React from "react";
import Dependencies from "./Dependencies";
import Conditions from "./Conditions";
import SyntaxTree from "./SyntaxTree";
import { TreeNodeDatum } from "react-d3-tree";

interface AnalysisResultsProps {
  analysis: {
    dependencies: string[];
    conditions: string[];
    treeData: TreeNodeDatum;
  };
  analysisView: string;
  isDarkMode: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  analysisView,
  isDarkMode,
}) => {
  return (
    <div className="analysis-results">
      {analysisView === "SyntaxTree" && (
        <SyntaxTree treeData={analysis.treeData} isDarkMode={isDarkMode} />
      )}
      {analysisView === "Dependencies" && (
        <Dependencies dependencies={analysis.dependencies} />
      )}
      {analysisView === "Conditions" && (
        <Conditions conditions={analysis.conditions} />
      )}
    </div>
  );
};

export default AnalysisResults;
