import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import React, { createContext, useContext, useMemo } from "react";

import { useNetworkContext } from "./NetworkContext";

interface DeFiScanContextI {
  getTransactionUrl: (txid: string, rawtx?: string) => string;
  getBlocksUrl: (blockCount: number) => string;
  getTokenUrl: (tokenId: number | string) => string;
  getAddressUrl: (address: string) => string;
  getVaultsUrl: (vaultId: string) => string;
  getAuctionsUrl: (vaultId: string, index: number) => string;
  getBlocksCountdownUrl: (blockCount: number) => string;
}

const DeFiScanContext = createContext<DeFiScanContextI>(undefined as any);
const baseDefiScanUrl = "https://defiscan.live";

export function useDeFiScanContext(): DeFiScanContextI {
  return useContext(DeFiScanContext);
}

function getNetworkParams(network: EnvironmentNetwork): string {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      // no-op: network param not required for MainNet
      return "";
    case EnvironmentNetwork.TestNet:
      return `?network=${EnvironmentNetwork.TestNet}`;
    case EnvironmentNetwork.DevNet:
      return `?network=${EnvironmentNetwork.DevNet}`;
    case EnvironmentNetwork.Changi:
      return `?network=${EnvironmentNetwork.Changi}`;
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
      return `?network=${EnvironmentNetwork.RemotePlayground}`;
    default:
      return "";
  }
}

export function getURLByNetwork(
  path: string,
  network: EnvironmentNetwork,
  id: number | string,
): string {
  return `${baseDefiScanUrl}/${path}/${id}${getNetworkParams(network)}`;
}

export function getTxURLByNetwork(
  network: EnvironmentNetwork,
  txid: string,
  rawtx?: string,
): string {
  let baseUrl = `${baseDefiScanUrl}/transactions/${txid}`;

  baseUrl += getNetworkParams(network);

  if (typeof rawtx === "string" && rawtx.length !== 0) {
    if (network === EnvironmentNetwork.MainNet) {
      baseUrl += `?rawtx=${rawtx}`;
    } else {
      baseUrl += `&rawtx=${rawtx}`;
    }
  }

  return baseUrl;
}

export function DeFiScanProvider(
  props: React.PropsWithChildren<any>,
): JSX.Element | null {
  const { network } = useNetworkContext();
  const { children } = props;

  const context: DeFiScanContextI = useMemo(
    () => ({
      getTransactionUrl: (txid: string, rawtx?: string): string =>
        getTxURLByNetwork(network, txid, rawtx),
      getBlocksUrl: (blockCount: number) =>
        getURLByNetwork("blocks", network, blockCount),
      getTokenUrl: (tokenId: number | string) =>
        getURLByNetwork("tokens", network, tokenId),
      getAddressUrl: (address: string) =>
        getURLByNetwork("address", network, address),
      getVaultsUrl: (vaultId: string) =>
        getURLByNetwork("vaults", network, vaultId),
      getAuctionsUrl: (vaultId: string, index: number) =>
        getURLByNetwork(`vaults/${vaultId}/auctions`, network, index),
      getBlocksCountdownUrl: (blockCount: number) =>
        getURLByNetwork("blocks/countdown", network, blockCount),
    }),
    [network],
  );

  return (
    <DeFiScanContext.Provider value={context}>
      {children}
    </DeFiScanContext.Provider>
  );
}
