import React, { useState, useRef, useEffect, useCallback } from "react";
import CodeViewer from "./codeViewer/CodeViewer";
import ExplanationViewer from "./explanationViewer/ExplanationViewer";
import ChatBox from "./chatbox/ChatBox";
import ExplainButton from "./explainButton/ExplainButton";
import Header from "./header/Header";
import { AnalysisView, ContractAnalysis } from "./analysis/analysisTypes";
import { analyzeSmartContract } from "../parser/treeSitterAll";

interface Contract {
  model: string;
  name: string;
  source: string;
  code: string;
  explanation: string;
}

interface MainContentProps {
  contract: Contract;
  isDarkMode: boolean;
  isCollapsed: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  contract,
  isDarkMode,
  isCollapsed,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const [selectedCode, setSelectedCode] = useState("");
  const [showAddButton, setShowAddButton] = useState(false);
  const [addButtonPos, setAddButtonPos] = useState({ top: 0, left: 0 });

  const [chatMessages, setChatMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [analysisView, setAnalysisView] = useState<AnalysisView>(
    AnalysisView.SyntaxTree
  );

  useEffect(() => {
    setAnalysis(null);
  }, [contract.source]);

  const [aboutOpen, setAboutOpen] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        aboutRef.current &&
        !aboutRef.current.contains(e.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(e.target as Node)
      ) {
        setAboutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const container = document.getElementById("split-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
          setLeftWidth(Math.max(20, Math.min(80, newWidth)));
        }
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleCodeSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedCode(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setAddButtonPos({ top: rect.top - 40, left: rect.left });
      setShowAddButton(true);
    } else {
      setShowAddButton(false);
      setSelectedCode("");
    }
  };

  const handleAddCodeToChat = () => {
    if (selectedCode) {
      setCurrentMessage(
        (prev) => `${prev}\n\`\`\`\n${selectedCode}\n\`\`\`\n`
      );
      setShowAddButton(false);
    }
  };

  const handleSend = useCallback(async () => {
    if (!currentMessage.trim()) return;
    const userMsg = { role: "user", content: currentMessage };
    const history = [...chatMessages, userMsg];
    setChatMessages(history);
    setCurrentMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          history: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contractCode: contract.code,
        }),
      });
      const data = await res.json();
      setChatMessages([...history, { role: "assistant", content: data.answer }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages([
        ...history,
        { role: "assistant", content: "Error communicating with the server." },
      ]);
    }
  }, [currentMessage, chatMessages, contract.code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAnalyze = async (): Promise<void> => {
    try {
      const result = await analyzeSmartContract(contract.code, contract.source);
      setAnalysis(result.analysis);
    } catch (err) {
      console.error("Analysis error:", err);
    }
  };

  const detectLanguage = (source: string): string => {
    if (source.endsWith(".py")) return "python";
    if (source.endsWith(".hs")) return "haskell";
    if (source.endsWith(".ak")) return "rust";
    if (source.endsWith(".sol")) return "solidity";
    return "plaintext";
  };

  return (
    <div
      className={`flex-1 flex flex-col items-center p-4 overflow-auto ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}
      style={{
        marginLeft: isCollapsed ? "4rem" : "16rem",
        transition: "margin-left 0.3s ease",
      }}
    >
      <Header
        isMobile={isMobile}
        iconRef={iconRef}
        isDarkMode={isDarkMode}
        toggleAbout={() => setAboutOpen(!aboutOpen)}
      />

      {aboutOpen && (
        <div
          ref={aboutRef}
          className={`mt-2 mb-4 p-4 rounded-lg shadow-md text-sm max-w-2xl ${
            isDarkMode ? "bg-[#1e293b] text-gray-300" : "bg-gray-100 text-gray-700"
          }`}
        >
          <p>
            <strong>Cardano Smart Contract Explainer</strong> uses AI to analyze
            and explain Cardano smart contracts written in Plutus (Haskell),
            Aiken, or Python. Features include Tree-Sitter code analysis,
            execution flow visualization, and an interactive chat for follow-up
            questions.
          </p>
        </div>
      )}

      <ExplainButton
        showAddButton={showAddButton}
        selectedCode={selectedCode}
        addButtonPos={addButtonPos}
        isDarkMode={isDarkMode}
        handleAddCodeToChat={handleAddCodeToChat}
      />

      <div
        id="split-container"
        className={`w-full flex ${isMobile ? "flex-col" : "flex-row"}`}
        style={{ maxWidth: "100%" }}
      >
        <CodeViewer
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          leftWidth={leftWidth}
          handleCodeSelection={handleCodeSelection}
          contract={contract}
          language={detectLanguage(contract.source)}
        />

        {!isMobile && (
          <div
            className={`w-2 cursor-col-resize flex items-center justify-center ${
              isDarkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
            onMouseDown={handleMouseDown}
          >
            <span className="text-gray-400">||</span>
          </div>
        )}

        <ExplanationViewer
          isDarkMode={isDarkMode}
          isMobile={isMobile}
          leftWidth={leftWidth}
          contract={contract}
          handleAnalyze={handleAnalyze}
          analysis={analysis}
          analysisView={analysisView}
          setAnalysisView={setAnalysisView}
          code={contract.code}
        />
      </div>

      <div className="w-full">
        <ChatBox
          isDarkMode={isDarkMode}
          messages={chatMessages}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          handleKeyDown={handleKeyDown}
          handleSend={handleSend}
        />
      </div>
    </div>
  );
};

export default MainContent;
