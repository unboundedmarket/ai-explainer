import React, { useState } from "react";
import XBlack from "./logos/XBlack.svg";
import XWhite from "./logos/XWhite.svg";
import PlatformStats from "./stats/PlatformStats";

const FileContractIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-72v8c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm96-114.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const SunIcon = ({ size = 20 }: { size?: number }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
  </svg>
);

const MoonIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
  </svg>
);

interface Contract {
  source: string;
  name: string;
}

interface UploadedContract {
  model: string;
  name: string;
  source: string;
  code: string;
  explanation: string;
}

interface SidebarProps {
  contracts: Contract[];
  selected: string;
  onSelect: (source: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  onContractUploaded?: (contract: UploadedContract) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  contracts,
  selected,
  onSelect,
  isDarkMode,
  toggleDarkMode,
  isCollapsed,
  setIsCollapsed,
  onContractUploaded,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const filteredContracts = contracts.filter((contract) =>
    contract.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    try {
      if (!selectedFile) {
        setUploadStatus("No file selected.");
        return;
      }
      const fileContent = await selectedFile.text();

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileContent: fileContent,
        }),
      });

      if (response.ok) {
        const newContract: UploadedContract = await response.json();
        // Add the uploaded contract to the sidebar.
        onContractUploaded?.(newContract);
        setUploadStatus("File uploaded successfully!");
      } else {
        setUploadStatus("Error uploading file.");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("Error uploading file.");
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-[calc(100%-2rem)] mt-4 mb-4 transition-all duration-300 flex flex-col
      backdrop-blur-lg rounded-lg shadow-lg ${
        isDarkMode
          ? "bg-[#141414]/70 text-white"
          : "bg-[#ffffff]/70 text-gray-900"
      }`}
    >
      <button
        className={`p-4 fixed top-3 ${isCollapsed ? "left-2" : "left-4"} z-50 ${
          isDarkMode
            ? "bg-[#334155] hover:bg-[#475569] text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
        } flex items-center justify-center rounded-full shadow-md border ${
          isDarkMode ? "border-[#475569]" : "border-gray-400"
        }`}
        style={{ borderWidth: "1px" }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>

      <div className="p-4 flex items-center justify-center mt-16">
        {isCollapsed ? (
          <button
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md ${
              isDarkMode ? "bg-[#1e293b]" : "bg-white"
            }`}
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <MoonIcon className="text-[#f8f9fa]" size={20} />
            ) : (
              <SunIcon size={20} />
            )}
          </button>
        ) : (
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer relative ${
              isDarkMode ? "bg-[#94a3b8]" : "bg-gray-300"
            }`}
            onClick={toggleDarkMode}
          >
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full shadow-md transform transition-transform duration-300 ${
                isDarkMode
                  ? "translate-x-6 bg-[#1e293b]"
                  : "translate-x-0 bg-white"
              }`}
            >
              {isDarkMode ? (
                <MoonIcon className="text-[#f8f9fa]" size={14} />
              ) : (
                <SunIcon size={14} />
              )}
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          <h2 className="text-lg font-bold mb-2 px-4">Smart Contracts</h2>
          <div className="px-4 mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-2 rounded ${
                isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
              }`}
            />
          </div>
        </>
      )}

      <ul className="flex-1 overflow-auto">
        {filteredContracts.map((contract) => (
          <li
            key={contract.source}
            onClick={() => onSelect(contract.source)}
            className={`flex items-center p-4 cursor-pointer ${
              selected === contract.source
                ? isDarkMode
                  ? "bg-[#475569]"
                  : "bg-gray-400"
                : isDarkMode
                ? "hover:bg-[#334155]"
                : "hover:bg-gray-300"
            }`}
          >
            <span className="mr-2"><FileContractIcon /></span>
            {!isCollapsed && (
              <span className="truncate" style={{ maxWidth: "100%" }}>
                {contract.name}
              </span>
            )}
          </li>
        ))}
        {filteredContracts.length === 0 && (
          <p className="text-gray-400 px-4">No contracts found</p>
        )}
      </ul>

      <footer className="mt-auto p-4 flex flex-col items-center">
        {!isCollapsed && <PlatformStats isDarkMode={isDarkMode} />}
        {!isCollapsed && (
          <div className="w-full mb-4 flex flex-col items-center space-y-2 px-2">
            <input
              type="file"
              accept=".sol,.py,.hs,.ak,.js,.ts,.tsx,.plutus,.aiken"
              onChange={handleFileChange}
              className={`text-sm cursor-pointer w-full ${
                isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"
              } rounded p-1`}
            />
            <button
              onClick={handleFileUpload}
              className={`w-full px-3 py-2 text-sm rounded shadow-md transition-colors duration-200 ${
                isDarkMode
                  ? "bg-[#334155] hover:bg-[#475569] text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Upload
            </button>
            {uploadStatus && (
              <span className="text-sm text-center">{uploadStatus}</span>
            )}
          </div>
        )}
        <a
          href="https://twitter.com/unboundedmarket"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={isDarkMode ? XWhite : XBlack} alt="X" className="h-6 w-6" />
        </a>
      </footer>
    </aside>
  );
};

export default Sidebar;
