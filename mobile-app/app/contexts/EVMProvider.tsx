import React, { createContext, useContext, useMemo, useState } from "react";
import { providers } from "ethers";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useCustomServiceProviderContext } from "./CustomServiceProvider";

interface EVMProviderContextI {
  provider: providers.JsonRpcProvider;
  chainId?: number;
}
const EVMProviderContext = createContext<EVMProviderContextI>(undefined as any);

export function useEVMProvider(): EVMProviderContextI {
  return useContext(EVMProviderContext);
}

export function EVMProvider({
  children,
}: React.PropsWithChildren<any>): JSX.Element | null {
  const { ethRpcUrl } = useCustomServiceProviderContext();
  const { network } = useNetworkContext();
  const [chainId, setChainId] = useState<number>();

  const getProvider = () => {
    const provider = new providers.JsonRpcProvider(ethRpcUrl);
    provider.getNetwork().then(({ chainId }) => setChainId(chainId));
    return provider;
  };

  const client = useMemo(
    () => ({
      provider: getProvider(),
      chainId,
    }),
    [network, chainId],
  );

  return (
    <EVMProviderContext.Provider value={client}>
      {children}
    </EVMProviderContext.Provider>
  );
}
