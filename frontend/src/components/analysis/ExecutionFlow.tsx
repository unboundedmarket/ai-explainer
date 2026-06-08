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
  const [error, setError] = useState<string | null>(null);
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  useEffect(() => {
    setNodes([]);
    setEdges([]);
  }, [code]);

  useEffect(() => {
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView({ padding: 0.2 });
    }
  }, [nodes, edges]);

  useEffect(() => {
    const fetchFlow = async () => {
      setLoading(true);
      setError(null);
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
      } catch (err) {
        console.error("Error generating execution flow:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate the execution flow. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFlow();
  }, [code]);

  return (
    <div style={{ width: "100%" }}>
      {loading && (
        <div
          className={`mb-2 px-3 py-2 rounded text-sm ${
            isDarkMode ? "bg-[#1e293b] text-gray-300" : "bg-gray-100 text-gray-700"
          }`}
        >
          Generating execution flow…
        </div>
      )}
      {error && (
        <div className="mb-2 px-3 py-2 rounded text-sm bg-red-100 border border-red-400 text-red-700">
          {error}
        </div>
      )}
      <div style={{ width: "100%", height: "600px" }}>
        <ReactFlow nodes={nodes} edges={edges} onInit={onInit} fitView>
          <MiniMap />
          <Controls />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ExecutionFlow;
