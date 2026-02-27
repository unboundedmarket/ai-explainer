import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowInstance,
  Node,
  Edge,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { call_openai } from "../../openai/call_openai";

interface ExecutionFlowProps {
  code: string;
  isDarkMode: boolean;
}

function layoutDAG(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 140, height: 40 });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    node.position = {
      x: dagreNode.x - dagreNode.width / 2,
      y: dagreNode.y - dagreNode.height / 2,
    };
    return node;
  });
  return { nodes: layoutedNodes, edges };
}

const ExecutionFlow: React.FC<ExecutionFlowProps> = ({ code, isDarkMode }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  useEffect(() => {
    setNodes([]);
    setEdges([]);
    setFlowError(null);
  }, [code]);

  useEffect(() => {
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView({ padding: 0.2 });
    }
  }, [nodes, edges]);

  useEffect(() => {
    const fetchFlow = async () => {
      setLoading(true);
      setFlowError(null);
      try {
        const response = await call_openai(code);
        if (!response.ok) {
          throw new Error(`OpenAI request failed: ${response.status}`);
        }
        const data = await response.json();
        let flowObj = data.flow;
        if (typeof flowObj === "string") {
          flowObj = JSON.parse(
            flowObj.replace(/^```json/, "").replace(/```$/, "").trim()
          );
        }
        const { nodes: dagNodes = [], links: dagLinks = [] } = flowObj || {};
        const rfNodes: Node[] = dagNodes.map(
          (n: { id: string; label: string }) => ({
            id: n.id,
            data: { label: n.label },
            position: { x: 0, y: 0 },
          })
        );
        const rfEdges: Edge[] = dagLinks.map(
          (link: { source: string; target: string }, i: number) => ({
            id: `e-${link.source}-${link.target}-${i}`,
            source: link.source,
            target: link.target,
          })
        );
        const { nodes: layouted, edges: layoutedEdges } = layoutDAG(
          rfNodes,
          rfEdges,
          "TB"
        );
        setNodes(layouted);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error("Error generating execution flow:", error);
        setFlowError(
          "Failed to generate execution flow. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFlow();
  }, [code]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-32 text-sm ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Generating execution flow…
      </div>
    );
  }

  if (flowError) {
    return (
      <div className="text-red-500 text-sm p-2 rounded border border-red-400">
        {flowError}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow nodes={nodes} edges={edges} onInit={onInit} fitView>
        <MiniMap />
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ExecutionFlow;
