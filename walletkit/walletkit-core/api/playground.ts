import { PlaygroundApiClient } from "@defichain/playground-api-client";

import { EnvironmentNetwork } from "./environment";
import { getDefaultDefiChainURL } from "./whale";

export function newPlaygroundClient(
  network: EnvironmentNetwork,
): PlaygroundApiClient {
  const url = getDefaultDefiChainURL(network);
  switch (network) {
    case EnvironmentNetwork.RemotePlayground:
      return new PlaygroundApiClient({
        url,
      });
    case EnvironmentNetwork.LocalPlayground:
      return new PlaygroundApiClient({ url });
    default:
      throw new Error(`playground not available for '${network}'`);
  }
}
