import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { useNetworkContext } from "@shared-contexts/NetworkContext";

const _useDefaultDefiChainURL = (): string => {
  const { network } = useNetworkContext();
  let url = "";

  switch (network) {
    case EnvironmentNetwork.MainNet:
    case EnvironmentNetwork.TestNet:
      url = "https://ocean.defichain.com";
      break;
    case EnvironmentNetwork.RemotePlayground:
      url = "https://playground.jellyfishsdk.com";
      break;
    case EnvironmentNetwork.LocalPlayground:
      url = "http://localhost:19553";
      break;
    default:
      url = "http://localhost:19553";
      break;
  }

  return url;
};

interface ServiceProviderLoader {
  isUrlLoaded: boolean;
  url: NonNullable<string>;
}

interface ServiceProviderURLProps {
  api: {
    get: () => Promise<string | undefined>;
    set: (url: NonNullable<string>) => Promise<void>;
  };
  network: any;
}

function _useServiceProviderUrl({
  api,
  network,
}: ServiceProviderURLProps): ServiceProviderLoader {
  const logger = useLogger();
  const [isUrlLoaded, setIsUrlLoaded] = useState<boolean>(false);
  const defaultDefichainURL = _useDefaultDefiChainURL();
  const [url, setUrl] = useState<NonNullable<string>>(defaultDefichainURL);

  useEffect(() => {
    api
      .get()
      .then((val) => {
        setUrl(val !== undefined ? val : defaultDefichainURL);
      })
      .catch((err) => logger.error(err))
      .finally(() => setIsUrlLoaded(true));
  }, [url, network]);

  return {
    isUrlLoaded,
    url,
  };
}

/* eslint-disable react/no-unused-prop-types */
interface ServiceProviderContextProps {
  url: NonNullable<string>;
  defaultUrl: string;
  isCustomUrl: boolean;
  setUrl: (val: NonNullable<string>) => Promise<void>;
}

const ServiceProviderContext = createContext<ServiceProviderContextProps>(
  undefined as any
);

export function useServiceProviderContext(): ServiceProviderContextProps {
  return useContext(ServiceProviderContext);
}

export function StoreServiceProvider(
  props: ServiceProviderContextProps & PropsWithChildren<any>
): JSX.Element | null {
  const { api } = props;
  const network = useNetworkContext();
  const { url } = _useServiceProviderUrl({
    api,
    network,
  });
  const defaultUrl = _useDefaultDefiChainURL();
  const [currentUrl, setCurrentUrl] = useState<string>(url);

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  const isCustomUrl = useMemo(() => {
    return currentUrl !== defaultUrl;
  }, [currentUrl, defaultUrl]);

  const setUrl = async (url: string): Promise<void> => {
    setCurrentUrl(url);
    await api.set(url);
  };

  const context: ServiceProviderContextProps = {
    url: currentUrl === undefined ? defaultUrl : currentUrl,
    isCustomUrl,
    defaultUrl,
    setUrl,
  };

  return (
    <ServiceProviderContext.Provider value={context}>
      {props.children}
    </ServiceProviderContext.Provider>
  );
}
