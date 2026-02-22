import React from "react";

interface ChatBoxProps {
  isDarkMode: boolean;
  messages: { role: string; content: string }[];
  currentMessage: string;
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSend: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  isDarkMode,
  messages,
  currentMessage,
  setCurrentMessage,
  handleKeyDown,
  handleSend,
}) => {
  return (
    <div
      className={`p-4 backdrop-blur-lg rounded-lg shadow-lg transition-colors duration-300 mb-4 ${
        isDarkMode
          ? "bg-[#141414]/70 text-white"
          : "bg-[#ffffff]/70 text-gray-900"
      }`}
    >
      <h2 className="text-xl font-bold mb-2">Chat</h2>
      <div className="border rounded p-2 mb-4 max-h-60 overflow-auto space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="whitespace-pre-wrap">
            <strong className="mr-2">
              {msg.role === "assistant" ? "Assistant:" : "You:"}
            </strong>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          className={`flex-1 p-2 rounded border ${
            isDarkMode
              ? "bg-[#0f0f0f] border-gray-600 text-white"
              : "bg-white border-gray-300 text-black"
          }`}
          placeholder="Ask a follow-up question..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className={`px-4 py-2 rounded ${
            isDarkMode
              ? "bg-[#334155] hover:bg-[#475569] text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
