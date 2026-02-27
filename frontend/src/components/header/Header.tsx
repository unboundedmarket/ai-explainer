import React from "react";

interface HeaderProps {
  isMobile: boolean;
  iconRef: React.RefObject<HTMLButtonElement>;
  isDarkMode: boolean;
  toggleAbout: () => void;
}

const LightbulbIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({
  isMobile,
  iconRef,
  isDarkMode,
  toggleAbout,
}) => {
  return isMobile ? (
    <div className="flex flex-col items-center space-y-2">
      <h1 className="text-2xl font-bold mb-1">Cardano Smart Contract Explainer</h1>
      <button
        ref={iconRef}
        aria-label="About this tool"
        className={`${isDarkMode ? "text-white" : "text-gray-900"} p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#334155] transition-colors duration-200`}
        onClick={toggleAbout}
      >
        <LightbulbIcon />
      </button>
      <p className="text-sm">Powered by UnboundedMarket</p>
    </div>
  ) : (
    <>
      <div className="inline-flex items-center justify-center space-x-2">
        <h1 className="text-2xl font-bold mb-1">Cardano Smart Contract Explainer</h1>
        <button
          ref={iconRef}
          aria-label="About this tool"
          className={`${isDarkMode ? "text-white" : "text-gray-900"} p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#334155] transition-colors duration-200`}
          onClick={toggleAbout}
        >
          <LightbulbIcon />
        </button>
      </div>
      <p className="text-sm">Powered by UnboundedMarket</p>
    </>
  );
};

export default Header;
