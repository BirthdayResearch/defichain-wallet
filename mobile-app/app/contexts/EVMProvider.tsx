import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { providers } from "ethers";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { useCustomServiceProviderContext } from "./CustomServiceProvider";

interface EVMProviderContextI {
  provider: providers.JsonRpcProvider | null;
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
  const [provider, setProvider] = useState<providers.JsonRpcProvider | null>(
    null,
  );

  const getProvider = async () => {
    try {
      const provider = new providers.JsonRpcProvider(ethRpcUrl);
      const { chainId } = await provider.getNetwork();
      setChainId(chainId);
      setProvider(provider);
    } catch (e) {
      // Note: Added this for cases wherein eth rpc url is invalid or unreachable
      setChainId(0);
      setProvider(null);
    }
  };

  useEffect(() => {
    getProvider();
  }, [ethRpcUrl]);

  const client = useMemo(
    () => ({
      provider,
      chainId,
    }),
    [network, chainId, ethRpcUrl],
  );

  return (
    <EVMProviderContext.Provider value={client}>
      {children}
    </EVMProviderContext.Provider>
  );
}
