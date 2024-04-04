import {
  JellyfishWallet,
  WalletHdNode,
  WalletHdNodeProvider,
} from "@defichain/jellyfish-wallet";

import { WhaleApiClient } from "@defichain/whale-api-client";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  EnvironmentNetwork,
  getJellyfishNetwork,
} from "@waveshq/walletkit-core";
import { LocalWhaleWalletAccountProvider } from "./memPool/LocalWhaleWalletAccountProvider";

export function initJellyfishWallet<HdNode extends WalletHdNode>(
  provider: WalletHdNodeProvider<HdNode>,
  network: EnvironmentNetwork,
  client: WhaleApiClient,
): JellyfishWallet<WhaleWalletAccount, HdNode> {
  const accountProvider = new LocalWhaleWalletAccountProvider(
    client,
    getJellyfishNetwork(network),
  );
  return new JellyfishWallet(provider, accountProvider);
}

export * from "./provider/mnemonic_encrypted";
export * from "./provider/mnemonic_unprotected";
export * from "./passcode_attempt";
export * from "./persistence";
