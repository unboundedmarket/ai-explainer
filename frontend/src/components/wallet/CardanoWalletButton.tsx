import React, { useState } from "react";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";

interface CardanoWalletButtonProps {
  isDarkMode: boolean;
  isCollapsed: boolean;
}

const CardanoWalletButton: React.FC<CardanoWalletButtonProps> = ({
  isDarkMode,
  isCollapsed,
}) => {
  const { isConnected, enabledWallet, stakeAddress, accountBalance, disconnect } =
    useCardano({ limitNetwork: NetworkType.TESTNET });
  const [showWalletList, setShowWalletList] = useState(false);

  const balanceADA = accountBalance
    ? (parseFloat(String(accountBalance)) / 1_000_000).toFixed(2)
    : "0.00";

  if (isCollapsed) {
    return (
      <div className="flex justify-center p-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isConnected
              ? "bg-green-600 text-white"
              : isDarkMode
              ? "bg-[#334155] text-white"
              : "bg-gray-300 text-gray-700"
          }`}
          title={isConnected ? `Connected: ${enabledWallet}` : "Not connected"}
        >
          {isConnected ? "₳" : "W"}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-4">
      {isConnected ? (
        <div className="space-y-2">
          <div
            className={`text-xs p-2 rounded ${
              isDarkMode ? "bg-[#1e293b] text-gray-300" : "bg-gray-100 text-gray-600"
            }`}
          >
            <p className="font-semibold text-green-500">Connected: {enabledWallet}</p>
            <p className="mt-1 truncate" title={stakeAddress || ""}>
              {stakeAddress ? `${stakeAddress.slice(0, 16)}...` : ""}
            </p>
            <p className="mt-1 font-bold">₳ {balanceADA}</p>
          </div>
          <button
            onClick={() => disconnect()}
            className={`w-full px-3 py-2 text-sm rounded shadow-md transition-colors ${
              isDarkMode
                ? "bg-red-800 hover:bg-red-700 text-white"
                : "bg-red-200 hover:bg-red-300 text-red-800"
            }`}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowWalletList(!showWalletList)}
            className={`w-full px-3 py-2 text-sm rounded shadow-md transition-colors ${
              isDarkMode
                ? "bg-[#334155] hover:bg-[#475569] text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Connect Wallet
          </button>
          {showWalletList && (
            <div
              className={`mt-2 p-2 rounded text-sm ${
                isDarkMode ? "bg-[#1e293b] text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-xs mb-2 text-gray-400">
                Install a CIP-30 wallet (Nami, Eternl, Flint, etc.) and refresh.
              </p>
              {typeof window !== "undefined" &&
                "cardano" in window &&
                Object.keys((window as any).cardano)
                  .filter((key) => (window as any).cardano[key]?.enable)
                  .map((walletName) => (
                    <button
                      key={walletName}
                      onClick={async () => {
                        try {
                          await (window as any).cardano[walletName].enable();
                          setShowWalletList(false);
                        } catch (e) {
                          console.error("Wallet connection error:", e);
                        }
                      }}
                      className={`w-full text-left px-2 py-1 rounded mb-1 capitalize ${
                        isDarkMode
                          ? "hover:bg-[#334155]"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      {walletName}
                    </button>
                  ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CardanoWalletButton;
