import React, { createContext, useContext, useMemo } from "react";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import {
  TD_CONTRACT_ADDR,
  getAddressFromDST20TokenId,
  stripEvmSuffixFromTokenId,
} from "@api/transaction/transfer_domain";

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
const baseMetaScanUrl = "https://meta.defiscan.live";

export function useDeFiScanContext(): DeFiScanContextI {
  return useContext(DeFiScanContext);
}

export function DeFiScanProvider(
  props: React.PropsWithChildren<any>,
): JSX.Element | null {
  const { network } = useNetworkContext();

  const context: DeFiScanContextI = useMemo(() => {
    return {
      getTransactionUrl: (txid: string, rawtx?: string): string => {
        return getTxURLByNetwork(network, txid, rawtx);
      },
      getBlocksUrl: (blockCount: number) => {
        return getURLByNetwork("blocks", network, blockCount);
      },
      getTokenUrl: (tokenId: number | string) => {
        return getURLByNetwork("tokens", network, tokenId);
      },
      getAddressUrl: (address: string) => {
        return getURLByNetwork("address", network, address);
      },
      getVaultsUrl: (vaultId: string) => {
        return getURLByNetwork("vaults", network, vaultId);
      },
      getAuctionsUrl: (vaultId: string, index: number) => {
        return getURLByNetwork(`vaults/${vaultId}/auctions`, network, index);
      },
      getBlocksCountdownUrl: (blockCount: number) => {
        return getURLByNetwork("blocks/countdown", network, blockCount);
      },
    };
  }, [network]);

  return (
    <DeFiScanContext.Provider value={context}>
      {props.children}
    </DeFiScanContext.Provider>
  );
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

    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
      return `?network=${EnvironmentNetwork.RemotePlayground}`;
    case EnvironmentNetwork.Changi:
      return `?network=${EnvironmentNetwork.Changi}`;
    default:
      return "";
  }
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

export function getURLByNetwork(
  path: string,
  network: EnvironmentNetwork,
  id: number | string,
): string {
  return `${baseDefiScanUrl}/${path}/${id}${getNetworkParams(network)}`;
}

export function getMetaScanTokenUrl(
  network: EnvironmentNetwork,
  id: string,
): string {
  const networkParams = getNetworkParams(network);
  const tokenId = stripEvmSuffixFromTokenId(id);

  // DFI token
  if (tokenId === 0) {
    return `${baseMetaScanUrl}/token/${TD_CONTRACT_ADDR}${networkParams}`;
  }

  // DST20 token
  const tokenAddress = getAddressFromDST20TokenId(tokenId);
  return `${baseMetaScanUrl}/token/${tokenAddress}${networkParams}`;
}
