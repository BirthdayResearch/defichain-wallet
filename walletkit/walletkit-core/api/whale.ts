import {
  WhaleApiClient,
  WhaleApiClientOptions,
  WhaleRpcClient,
} from "@defichain/whale-api-client";

import { EnvironmentNetwork } from "./environment";

export function newOceanOptions(
  network: EnvironmentNetwork,
  url?: string,
): WhaleApiClientOptions {
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
      return {
        url: url ?? "http://localhost:19553",
        network: "regtest",
        version: "v0",
      };
    case EnvironmentNetwork.RemotePlayground:
      return {
        url: url ?? "https://playground.jellyfishsdk.com",
        network: "regtest",
        version: "v0",
      };
    case EnvironmentNetwork.TestNet:
      return {
        url: url ?? "https://testnet.ocean.jellyfishsdk.com",
        network: "testnet",
        version: "v0",
      };
    case EnvironmentNetwork.DevNet:
      return {
        url: url ?? "http://devnet.ocean.jellyfishsdk.com",
        network: "devnet",
        version: "v0",
      };
    case EnvironmentNetwork.Changi:
      return {
        url: url ?? "https://changi.ocean.jellyfishsdk.com",
        network: "changi",
        version: "v0",
      };
    case EnvironmentNetwork.MainNet:
    default:
      return {
        // url: url ?? "https://ocean.defichain.com",
        url: url ?? "http://34.143.176.39:3002",
        network: "mainnet",
        version: "v0",
      };
  }
}

export function newWhaleAPIClient(
  options: WhaleApiClientOptions,
): WhaleApiClient {
  return new WhaleApiClient(options);
}

export function newWhaleRpcClient(
  options: WhaleApiClientOptions,
): WhaleRpcClient {
  return new WhaleRpcClient(
    `${options.url}/${options.version}/${options.network}/rpc`,
  );
}

export function getDefaultDefiChainURL(network: EnvironmentNetwork): string {
  const { url } = newOceanOptions(network);
  return url as string;
}
