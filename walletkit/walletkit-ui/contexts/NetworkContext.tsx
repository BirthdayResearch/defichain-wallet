import { NetworkName } from "@defichain/jellyfish-network";
import {
  EnvironmentNetwork,
  getJellyfishNetwork,
} from "@waveshq/walletkit-core";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import { BaseLogger } from "./logger";

interface NetworkContextI {
  network: EnvironmentNetwork;
  networkName: NetworkName;
  updateNetwork: (network: EnvironmentNetwork) => Promise<void>;
}

const NetworkContext = createContext<NetworkContextI>(undefined as any);

export function useNetworkContext(): NetworkContextI {
  return useContext(NetworkContext);
}

export interface NetworkProviderProps extends PropsWithChildren<{}> {
  api: {
    getNetwork: () => Promise<EnvironmentNetwork>;
    setNetwork: (network: EnvironmentNetwork) => Promise<void>;
  };
  logger: BaseLogger;
}

export function NetworkProvider(
  props: NetworkProviderProps,
): JSX.Element | null {
  const [network, setNetwork] = useState<EnvironmentNetwork>();
  const [networkName, setNetworkName] = useState<NetworkName>();
  const { api, logger, children } = props;

  useEffect(() => {
    api
      .getNetwork()
      .then(async (value: EnvironmentNetwork) => {
        setNetworkName(getJellyfishNetwork(value).name);
        setNetwork(value);
      })
      .catch(logger.error);
  }, []);

  if (network === undefined || networkName === undefined) {
    return null;
  }

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const context: NetworkContextI = {
    network,
    networkName,
    async updateNetwork(value: EnvironmentNetwork): Promise<void> {
      await api.setNetwork(value);
      setNetworkName(getJellyfishNetwork(value).name);
      setNetwork(value);
    },
  };

  return (
    <NetworkContext.Provider value={context}>
      {children}
    </NetworkContext.Provider>
  );
}
