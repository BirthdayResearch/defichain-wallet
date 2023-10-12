import React, { createContext, useContext, useMemo } from "react";
import { providers } from "ethers";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { getEthRpcUrl } from "@store/evm";

interface EVMProviderContextI {
  provider: providers.JsonRpcProvider;
}
const EVMProviderContext = createContext<EVMProviderContextI>(undefined as any);

export function useEVMProvider(): EVMProviderContextI {
  return useContext(EVMProviderContext);
}

export function EVMProvider({
  children,
}: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext();
  const client = useMemo(
    () => ({
      provider: new providers.JsonRpcProvider(getEthRpcUrl(network)),
    }),
    [network],
  );

  return (
    <EVMProviderContext.Provider value={client}>
      {children}
    </EVMProviderContext.Provider>
  );
}
