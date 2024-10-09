import { fromAddress } from "@defichain/jellyfish-address";
import { Script } from "@defichain/jellyfish-transaction";
import {
  JellyfishWallet,
  WalletHdNode,
  WalletHdNodeProvider,
} from "@defichain/jellyfish-wallet";
import {
  MnemonicHdNodeProvider,
  MnemonicProviderData,
  validateMnemonicSentence,
} from "@defichain/jellyfish-wallet-mnemonic";
import { WhaleApiClient } from "@defichain/whale-api-client";
import {
  WhaleWalletAccount,
  WhaleWalletAccountProvider,
} from "@defichain/whale-api-wallet";
import {
  EnvironmentNetwork,
  getBip32Option,
  getJellyfishNetwork,
} from "@waveshq/walletkit-core";
import { BigNumber } from "bignumber.js";

enum WalletType {
  MNEMONIC_UNPROTECTED = "MNEMONIC_UNPROTECTED",
  MNEMONIC_ENCRYPTED = "MNEMONIC_ENCRYPTED",
}

interface WalletPersistenceDataI<T> {
  type: WalletType;
  /* To migrate between app version upgrade */
  version: "v1";
  /* Raw Data encoded in WalletType specified format */
  raw: T;
}

export function toData(
  mnemonic: string[],
  envNetwork: EnvironmentNetwork,
): WalletPersistenceDataI<MnemonicProviderData> {
  const options = getBip32Option(envNetwork);
  const data = MnemonicHdNodeProvider.wordsToData(mnemonic, options);

  return {
    version: "v1",
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: data,
  };
}

export function initProvider(
  data: WalletPersistenceDataI<MnemonicProviderData>,
  envNetwork: EnvironmentNetwork,
): MnemonicHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_UNPROTECTED || data.version !== "v1") {
    throw new Error("Unexpected WalletPersistenceDataI");
  }

  const options = getBip32Option(envNetwork);
  return MnemonicHdNodeProvider.fromData(data.raw, options);
}

export function initJellyfishWallet<HdNode extends WalletHdNode>(
  provider: WalletHdNodeProvider<HdNode>,
  urlNetwork: string,
  envNetwork: EnvironmentNetwork,
): JellyfishWallet<WhaleWalletAccount, HdNode> {
  const client = getWhaleClient(urlNetwork, envNetwork);
  const accountProvider = new WhaleWalletAccountProvider(
    client,
    getJellyfishNetwork(envNetwork),
  );
  return new JellyfishWallet(provider, accountProvider);
}

export function createWallet(
  urlNetwork: string,
  envNetwork: EnvironmentNetwork,
  mnemonic: string,
  index: number = 0,
): WhaleWalletAccount {
  if (!validateMnemonicSentence(mnemonic)) {
    throw new Error("Invalid DeFiChain mnemonic!");
  }
  const data = toData(mnemonic.split(" "), envNetwork);
  const provider = initProvider(data, envNetwork);
  return initJellyfishWallet(provider, urlNetwork, envNetwork).get(index);
}

export function getWhaleClient(
  urlNetwork: string,
  envNetwork: EnvironmentNetwork,
): WhaleApiClient {
  return new WhaleApiClient({
    url: urlNetwork,
    version: "v0",
    network: getJellyfishNetwork(envNetwork).name,
  });
}

export function getAddressScript(
  address: string,
  envNetwork: EnvironmentNetwork,
): Script {
  const decodedAddress = fromAddress(
    address,
    getJellyfishNetwork(envNetwork).name,
  );
  if (decodedAddress === undefined) {
    throw new Error(`Unable to decode Address - ${address}`);
  }
  return decodedAddress.script;
}

/**
 * Get current wallet UTXO balance
 */
export async function getUTXOBalance(
  address: string,
  client: WhaleApiClient,
): Promise<BigNumber> {
  return new BigNumber(await client.address.getBalance(address));
}
