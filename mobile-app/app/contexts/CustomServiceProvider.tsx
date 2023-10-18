import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { useNetworkContext } from "@waveshq/walletkit-ui";
import { BaseLogger } from "@waveshq/walletkit-ui/dist/contexts/logger";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export enum CustomServiceProviderType {
  DVM = "DVM",
  EVM = "EVM",
  ETHRPC = "ETHRPC",
}

interface CustomServiceProviderContextProps {
  api: {
    get: (type: CustomServiceProviderType) => Promise<string | undefined>;
    set: (
      url: NonNullable<string>,
      type?: CustomServiceProviderType,
    ) => Promise<void>;
  };
  logger: BaseLogger;
}

interface CustomServiceProviderURLProps
  extends CustomServiceProviderContextProps {
  network: EnvironmentNetwork;
  defaultUrl: string;
  type: CustomServiceProviderType;
}

interface CustomServiceProviderLoader {
  isUrlLoaded: boolean;
  url: NonNullable<string>;
}

function useCustomServiceProviderUrl({
  api,
  network,
  logger,
  defaultUrl,
  type,
}: CustomServiceProviderURLProps): CustomServiceProviderLoader {
  const [isUrlLoaded, setIsUrlLoaded] = useState<boolean>(false);
  const [url, setUrl] = useState<NonNullable<string>>(defaultUrl);

  useEffect(() => {
    api
      .get(type)
      .then((val) => {
        setUrl(val !== undefined ? val : defaultUrl);
      })
      .catch((err) => logger.error(err))
      .finally(() => setIsUrlLoaded(true));
  }, [url, network]);

  return {
    isUrlLoaded,
    url,
  };
}

interface CustomServiceProviderContextI {
  evmUrl: NonNullable<string>;
  ethRpcUrl: NonNullable<string>;
  isCustomEvmUrl: boolean;
  isCustomEthRpcUrl: boolean;
  defaultEvmUrl: string;
  defaultEthRpcUrl: string;
  setCustomUrl: (
    url: NonNullable<string>,
    type?: CustomServiceProviderType,
  ) => Promise<void>;
}

const CustomServiceProviderContext =
  createContext<CustomServiceProviderContextI>(undefined as any);

export function useCustomServiceProviderContext(): CustomServiceProviderContextI {
  return useContext(CustomServiceProviderContext);
}

function getBlockscoutUrl(network: EnvironmentNetwork) {
  // TODO: Add proper blockscout url for each network
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
    case EnvironmentNetwork.DevNet:
    case EnvironmentNetwork.Changi:
      return "https://blockscout.changi.ocean.jellyfishsdk.com";
    case EnvironmentNetwork.TestNet:
      return "https://blockscout.testnet.ocean.jellyfishsdk.com";
    case EnvironmentNetwork.MainNet:
    default:
      return "https://blockscout.mainnet.ocean.jellyfishsdk.com";
  }
}

function getEthRpcUrl(network: EnvironmentNetwork) {
  // TODO: Add proper ethereum RPC URLs for each network
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
      return "http://localhost:19551";
    case EnvironmentNetwork.RemotePlayground:
    case EnvironmentNetwork.DevNet:
    case EnvironmentNetwork.Changi:
      return "http://34.34.156.49:20551"; // TODO: add final eth rpc url for changi, devnet and remote playground
    case EnvironmentNetwork.TestNet:
      return "http://34.38.30.102:18551"; // TODO: add final eth rpc url for testnet, with proper domain name
    case EnvironmentNetwork.MainNet:
    default:
      return "https://changi.dfi.team"; // TODO: add final eth rpc url for mainnet, with proper domain name
  }
}

export function CustomServiceProvider(
  props: CustomServiceProviderContextProps & PropsWithChildren<any>,
): JSX.Element | null {
  const { api, children, logger } = props;
  const { network } = useNetworkContext();
  const params = { api, network, logger };

  // EVM
  const defaultEvmUrl = getBlockscoutUrl(network);
  const { url: evmUrl } = useCustomServiceProviderUrl({
    ...params,
    defaultUrl: defaultEvmUrl,
    type: CustomServiceProviderType.EVM,
  });

  // ETH-RPC
  const defaultEthRpcUrl = getEthRpcUrl(network);
  const { url: ethRpcUrl } = useCustomServiceProviderUrl({
    ...params,
    defaultUrl: defaultEthRpcUrl,
    type: CustomServiceProviderType.ETHRPC,
  });

  const [currentUrl, setCurrentUrl] = useState<{
    [key in CustomServiceProviderType]: string;
  }>({
    [CustomServiceProviderType.DVM]: "", // not used here, added only to satify `key` type
    [CustomServiceProviderType.EVM]: evmUrl,
    [CustomServiceProviderType.ETHRPC]: ethRpcUrl,
  });

  useEffect(() => {
    setCurrentUrl((prevState) => ({
      ...prevState,
      [CustomServiceProviderType.EVM]: evmUrl,
    }));
  }, [evmUrl]);

  useEffect(() => {
    setCurrentUrl((prevState) => ({
      ...prevState,
      [CustomServiceProviderType.ETHRPC]: ethRpcUrl,
    }));
  }, [ethRpcUrl]);

  const isCustomEvmUrl = useMemo(
    () => currentUrl.EVM !== defaultEvmUrl,
    [currentUrl.EVM, defaultEvmUrl],
  );
  const isCustomEthRpcUrl = useMemo(
    () => currentUrl.ETHRPC !== defaultEthRpcUrl,
    [currentUrl.ETHRPC, defaultEthRpcUrl],
  );

  const setCustomUrl = async (
    newUrl: string,
    type: CustomServiceProviderType = CustomServiceProviderType.DVM,
  ): Promise<void> => {
    setCurrentUrl((prevState) => ({ ...prevState, [type]: newUrl }));
    await api.set(newUrl, type);
  };

  const context: CustomServiceProviderContextI = {
    evmUrl: currentUrl.EVM ?? defaultEvmUrl,
    ethRpcUrl: currentUrl.ETHRPC ?? defaultEthRpcUrl,
    isCustomEvmUrl,
    isCustomEthRpcUrl,
    defaultEvmUrl,
    defaultEthRpcUrl,
    setCustomUrl,
  };

  return (
    <CustomServiceProviderContext.Provider value={context}>
      {children}
    </CustomServiceProviderContext.Provider>
  );
}
