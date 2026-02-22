import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeViewerProps {
  isDarkMode: boolean;
  isMobile: boolean;
  leftWidth: number;
  handleCodeSelection: () => void;
  contract: {
    name: string;
    source?: string;
    code: string;
  };
  language: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  isDarkMode,
  isMobile,
  leftWidth,
  handleCodeSelection,
  contract,
  language,
}) => {
  return (
    <div
      className={`p-4 overflow-auto backdrop-blur-lg rounded-lg mb-4 shadow-lg transition-colors duration-300 relative ${
        isDarkMode
          ? "bg-[#141414]/70 text-white"
          : "bg-[#ffffff]/70 text-gray-900"
      }`}
      style={{ width: isMobile ? "100%" : `${leftWidth}%` }}
      onMouseUp={handleCodeSelection}
    >
      {isMobile ? (
        <>
          <h2 className="text-xl font-bold mb-1 break-all">
            {contract.name} Code
          </h2>
          {contract.source && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 break-all">
              {contract.source}
            </p>
          )}
        </>
      ) : (
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 break-all">
          <span>{contract.name} Code</span>
          {contract.source && (
            <span className="text-sm text-gray-600 dark:text-gray-300 break-all">
              ({contract.source})
            </span>
          )}
        </h2>
      )}

      <div className="overflow-auto max-h-[70vh] rounded-md">
        <SyntaxHighlighter
          language={language}
          style={isDarkMode ? vscDarkPlus : vs}
          showLineNumbers
          customStyle={{
            background: "transparent",
            fontSize: "0.9rem",
            lineHeight: "1.4em",
            borderRadius: "0.5rem",
            padding: "1em",
          }}
        >
          {contract.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeViewer;
