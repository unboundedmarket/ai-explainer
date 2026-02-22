import { WalletApi } from "../providers/types";
import {
  Address,
  BaseAddress,
  RewardAddress,
} from "@emurgo/cardano-serialization-lib-asmjs";

export async function getStakeAddress(wallet: WalletApi) {
  const networkId = await wallet.getNetworkId();
  const changeAddrHex = await wallet.getChangeAddress();

  const changeAddress = Address.from_bytes(Buffer.from(changeAddrHex, "hex"));
  const baseAddress = BaseAddress.from_address(changeAddress);
  if (!baseAddress) {
    throw new Error("The provided change address is not a BaseAddress.");
  }

  const stakeCredential = baseAddress.stake_cred();
  const stakeAddress = RewardAddress.new(networkId, stakeCredential).to_address();

  return [stakeAddress.to_hex(), stakeAddress.to_bech32()];
}

export async function authenticate(wallet: WalletApi) {
  const [stakeAddrHex, stakeAddrBech32] = await getStakeAddress(wallet);
  const messageUtf = `account: ${stakeAddrBech32}`;
  const messageHex = Buffer.from(messageUtf).toString("hex");
  const sigData = await wallet.signData(stakeAddrHex, messageHex);
  return sigData;
}
