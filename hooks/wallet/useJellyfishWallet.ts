import { JellyfishWallet, WalletAccount, WalletHdNode } from "@defichain/jellyfish-wallet";
import { getNetwork, Network } from "@defichain/jellyfish-network";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { NetworkName, WhaleApiState } from "../../store/network";
import { WhaleWalletAccountProvider } from "@defichain/whale-api-wallet";
import { useWhaleApiClient } from "../api/useWhaleApiClient";
import { MnemonicHdNodeStorage } from "./mnemonic";

/**
 * Use a loaded Jellyfish Wallet.
 * Attempting to useJellyfishWallet without having it loaded with end exceptionally.
 * You can load a wallet via redux dispatch(loadWallet()) in store/wallet.ts
 */
export async function useJellyfishWallet (): Promise<JellyfishWallet<WalletAccount, WalletHdNode>> {
  const whale = useSelector<RootState, WhaleApiState | undefined>(state => state.network.whale)
  const network = parseNetwork(whale?.network)
  const mnemonic = new MnemonicHdNodeStorage(network)

  const client = useWhaleApiClient()
  const accountProvider = new WhaleWalletAccountProvider(client, network)
  const nodeProvider = await mnemonic.getHdNodeProvider()
  return new JellyfishWallet(nodeProvider, accountProvider)
}

function parseNetwork (network?: NetworkName): Network {
  switch (network) {
    case "playground":
      return getNetwork('regtest')
    case "mainnet":
    case "testnet":
    case "regtest":
      return getNetwork(network)
    default:
      throw new Error('attempting to useJellyfishWallet() without network set is not allowed')
  }
}
