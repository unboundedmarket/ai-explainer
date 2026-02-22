import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import CardanoWalletButton from "./components/wallet/CardanoWalletButton";
import { CardanoWalletProvider } from "./providers/CardanoWalletContext";
import contractData from "./data/smart_contract_explanations.json";

interface ContractEntry {
  model: string;
  name: string;
  source: string;
  code: string;
  explanation: string;
}

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const contracts: ContractEntry[] = contractData as ContractEntry[];
  const [selectedSource, setSelectedSource] = useState(
    contracts.length > 0 ? contracts[0].source : ""
  );

  const selectedContract = contracts.find(
    (c) => c.source === selectedSource
  ) || contracts[0];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <CardanoWalletProvider>
      <div
        className={`h-screen flex transition-colors duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]"
            : "bg-gradient-to-br from-[#f0f4f8] via-[#dbe2ef] to-[#f0f4f8]"
        }`}
      >
        <Sidebar
          contracts={contracts}
          selected={selectedSource}
          onSelect={setSelectedSource}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <div
          className="fixed bottom-20 z-50"
          style={{ left: isCollapsed ? "0.25rem" : "0.5rem", width: isCollapsed ? "3.5rem" : "15rem" }}
        >
          <CardanoWalletButton isDarkMode={isDarkMode} isCollapsed={isCollapsed} />
        </div>

        {selectedContract && (
          <MainContent
            contract={selectedContract}
            isDarkMode={isDarkMode}
            isCollapsed={isCollapsed}
          />
        )}
      </div>
    </CardanoWalletProvider>
  );
};

export default App;
