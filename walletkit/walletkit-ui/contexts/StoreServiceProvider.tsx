import {
  EnvironmentNetwork,
  getDefaultDefiChainURL,
} from "@waveshq/walletkit-core";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { BaseLogger } from "./logger";
import { useNetworkContext } from "./NetworkContext";

interface ServiceProviderContextProps {
  api: {
    get: () => Promise<string | undefined>;
    set: (url: NonNullable<string>) => Promise<void>;
  };
  logger: BaseLogger;
}

interface ServiceProviderURLProps extends ServiceProviderContextProps {
  network: EnvironmentNetwork;
}

interface ServiceProviderLoader {
  isUrlLoaded: boolean;
  url: NonNullable<string>;
}

function useServiceProviderUrl({
  api,
  network,
  logger,
}: ServiceProviderURLProps): ServiceProviderLoader {
  const [isUrlLoaded, setIsUrlLoaded] = useState<boolean>(false);
  const defaultDefichainURL = getDefaultDefiChainURL(network);
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

interface ServiceProviderContextI {
  url: NonNullable<string>;
  defaultUrl: string;
  isCustomUrl: boolean;
  setUrl: (val: NonNullable<string>) => Promise<void>;
}

const ServiceProviderContext = createContext<ServiceProviderContextI>(
  undefined as any,
);

export function useServiceProviderContext(): ServiceProviderContextI {
  return useContext(ServiceProviderContext);
}

export function StoreServiceProvider(
  props: ServiceProviderContextProps & PropsWithChildren<any>,
): JSX.Element | null {
  const { api, children, logger } = props;
  const { network } = useNetworkContext();
  const { url } = useServiceProviderUrl({
    api,
    network,
    logger,
  });
  const defaultUrl = getDefaultDefiChainURL(network);
  const [currentUrl, setCurrentUrl] = useState<string>(url);

  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

  const isCustomUrl = useMemo(
    () => currentUrl !== defaultUrl,
    [currentUrl, defaultUrl],
  );

  const setUrl = async (newUrl: string): Promise<void> => {
    setCurrentUrl(newUrl);
    await api.set(newUrl);
  };

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const context: ServiceProviderContextI = {
    url: currentUrl === undefined ? defaultUrl : currentUrl,
    isCustomUrl,
    defaultUrl,
    setUrl,
  };

  return (
    <ServiceProviderContext.Provider value={context}>
      {children}
    </ServiceProviderContext.Provider>
  );
}
