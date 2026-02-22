import React from "react";

interface ExplainButtonProps {
  showAddButton: boolean;
  selectedCode: string;
  addButtonPos: { top: number; left: number };
  isDarkMode: boolean;
  handleAddCodeToChat: () => void;
}

const ExplainButton: React.FC<ExplainButtonProps> = ({
  showAddButton,
  selectedCode,
  addButtonPos,
  isDarkMode,
  handleAddCodeToChat,
}) => {
  if (!showAddButton || !selectedCode) return null;

  return (
    <button
      onClick={handleAddCodeToChat}
      style={{
        position: "fixed",
        top: addButtonPos.top,
        left: addButtonPos.left,
        zIndex: 9999,
      }}
      className={`px-3 py-2 text-sm rounded shadow transition-colors ${
        isDarkMode
          ? "bg-[#334155] hover:bg-[#475569] text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
      }`}
    >
      Explain
    </button>
  );
};

export default ExplainButton;
