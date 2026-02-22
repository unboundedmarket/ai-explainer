import React, { useRef, useEffect, useState } from "react";
import Tree, { TreeNodeDatum } from "react-d3-tree";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface TreeVisualizationProps {
  data: TreeNodeDatum;
  onNodeClick?: (node: TreeNodeDatum) => void;
  isDarkMode: boolean;
}

const containerStyles: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  data,
  onNodeClick,
  isDarkMode,
}) => {
  const treeContainer = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  useEffect(() => {
    if (treeContainer.current) {
      const { clientWidth, clientHeight } = treeContainer.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
    const handleResize = () => {
      if (treeContainer.current) {
        const { clientWidth, clientHeight } = treeContainer.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nodeFillColor = isDarkMode ? "#4a90e2" : "#1f78b4";
  const highlightedFillColor = isDarkMode ? "#ff6b6b" : "#f00";
  const textColor = isDarkMode ? "#ffffff" : "#000000";
  const tooltipTheme = isDarkMode ? "custom-dark" : "light";

  useEffect(() => {
    const styleId = "tippy-custom-dark-theme";
    if (isDarkMode) {
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          .tippy-box[data-theme~='custom-dark'] {
            background-color: #333333;
            color: #ffffff;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 12px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
          }
          .tippy-box[data-theme~='custom-dark'] .tippy-arrow::before {
            background-color: #333333;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      const el = document.getElementById(styleId);
      if (el) document.head.removeChild(el);
    }
  }, [isDarkMode]);

  const renderCustomNode = ({ nodeDatum }: { nodeDatum: TreeNodeDatum }) => (
    <g>
      <Tippy
        content={(nodeDatum.attributes?.text as string) || ""}
        placement="top"
        delay={[100, 100]}
        theme={tooltipTheme}
        animation="shift-away"
      >
        <circle
          r={15}
          fill={
            nodeDatum.name === highlightedNode
              ? highlightedFillColor
              : nodeFillColor
          }
          stroke={isDarkMode ? "#ffffff" : "#555555"}
          strokeWidth={1}
          onClick={() => {
            setHighlightedNode(nodeDatum.name);
            if (onNodeClick) onNodeClick(nodeDatum);
          }}
          style={{ cursor: onNodeClick ? "pointer" : "default" }}
        />
      </Tippy>
      <text
        strokeWidth="3"
        stroke="none"
        x="20"
        dy="-10"
        fontSize="10px"
        style={{ userSelect: "none", fill: textColor }}
      >
        {nodeDatum.name}
      </text>
    </g>
  );

  const getCustomPathClass = () =>
    isDarkMode ? "custom-link-dark" : "custom-link-light";

  return (
    <div ref={treeContainer} style={containerStyles}>
      <Tree
        data={data}
        translate={{ x: dimensions.width / 2, y: 50 }}
        orientation="vertical"
        pathFunc="elbow"
        collapsible={true}
        zoomable={true}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        renderCustomNodeElement={renderCustomNode}
        pathClassFunc={getCustomPathClass}
      />
    </div>
  );
};

export default TreeVisualization;
