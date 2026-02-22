export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface Contract {
  model: string;
  name: string;
  source: string;
  code: string;
  explanation: string;
}

export interface MainContentProps {
  contract: Contract;
  isDarkMode: boolean;
  isCollapsed: boolean;
}
