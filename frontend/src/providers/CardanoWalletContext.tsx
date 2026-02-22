import React, { useEffect, useRef, useCallback, useContext, createContext } from "react";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import { Cardano, WalletApi } from "./types";
import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { authenticate } from "../cardano/basic";

type CardanoWalletType = {
  getWallet: () => Promise<WalletApi | null>;
  userAuthenticate: () => Promise<{
    userAddr_bech32: string;
    witness: { signature: string; key: string };
  }>;
  cardanoDisconnect: () => void;
};

const CardanoWalletContext = createContext<CardanoWalletType | undefined>(undefined);

export const CardanoWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { disconnect, enabledWallet } = useCardano({
    limitNetwork: NetworkType.TESTNET,
  });
  const APIRef = useRef<WalletApi | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateAPIRef = async () => {
        try {
          if (!("cardano" in window)) {
            throw new Error("Cardano is not defined");
          }
          const cardano = (window as any).cardano as Cardano;
          if (enabledWallet) {
            APIRef.current = await cardano[enabledWallet].enable();
          }
        } catch (e) {
          console.error("updateAPIRef ERROR >>", e);
        }
      };
      updateAPIRef();
    }
  }, [enabledWallet]);

  const getWallet = async (): Promise<WalletApi | null> => {
    const timeout = 5000;
    const interval = 100;
    let waited = 0;
    while (APIRef.current === null) {
      if (waited >= timeout) {
        console.error("Timeout waiting for Cardano wallet APIRef to be ready");
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
      waited += interval;
    }
    return APIRef.current;
  };

  const userAuthenticate = async () => {
    const cardanoWallet = await getWallet();
    if (cardanoWallet) {
      const userAddr_hex = (await cardanoWallet.getUsedAddresses())[0];
      const userAddr_bech32 = Address.from_hex(userAddr_hex).to_bech32();
      const witness = await authenticate(cardanoWallet);
      return { userAddr_bech32, witness };
    }
    throw new Error("No Cardano wallet available");
  };

  const cardanoDisconnect = useCallback(() => {
    console.log("Cardano disconnecting...");
    disconnect();
  }, [disconnect]);

  return (
    <CardanoWalletContext.Provider
      value={{ getWallet, userAuthenticate, cardanoDisconnect }}
    >
      {children}
    </CardanoWalletContext.Provider>
  );
};

export const useCardanoWallets = () => {
  const context = useContext(CardanoWalletContext);
  if (!context) {
    throw new Error(
      "useCardanoWallets should be used within CardanoWalletContext"
    );
  }
  return context;
};
