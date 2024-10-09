import {
  PlaygroundApiClient,
  PlaygroundRpcClient,
} from "@defichain/playground-api-client";
import { isPlayground, newPlaygroundClient } from "@waveshq/walletkit-core";
import { createContext, useContext, useMemo } from "react";
import * as React from "react";

import { useNetworkContext } from "./NetworkContext";

interface PlaygroundContextI {
  rpc: PlaygroundRpcClient;
  api: PlaygroundApiClient;
}

const PlaygroundContext = createContext<PlaygroundContextI | undefined>(
  undefined,
);

export function usePlaygroundContext(): PlaygroundContextI {
  const context = useContext(PlaygroundContext);
  if (context !== undefined) {
    return context;
  }

  throw new Error("Playground not configured");
}

export function PlaygroundProvider(
  props: React.PropsWithChildren<any>,
): JSX.Element | null {
  const { children } = props;
  const { network } = useNetworkContext();

  const context = useMemo(() => {
    if (!isPlayground(network)) {
      return undefined;
    }

    const api = newPlaygroundClient(network);
    const rpc = new PlaygroundRpcClient(api);
    return { api, rpc };
  }, [network]);

  return (
    <PlaygroundContext.Provider value={context}>
      {children}
    </PlaygroundContext.Provider>
  );
}
