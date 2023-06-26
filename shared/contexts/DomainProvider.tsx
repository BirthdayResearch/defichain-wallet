import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { useLogger } from "@shared-contexts/NativeLoggingProvider";

interface DomainLoader {
  isDomainLoaded: boolean;
  domain: NonNullable<string>;
}

interface DomainContextI {
  api: {
    get: () => Promise<string | null>;
    set: (domain: NonNullable<string>) => Promise<void>;
  };
}

export function useDomain({ api }: DomainContextI): DomainLoader {
  const defaultDomain = "DFI";
  const logger = useLogger();
  const [isDomainLoaded, setIsDomainLoaded] = useState<boolean>(false);
  const [domain, setDomain] = useState<NonNullable<string>>(defaultDomain);

  useEffect(() => {
    api
      .get()
      .then((l) => {
        let currentDomain: NonNullable<string> = defaultDomain;
        if (l !== null && l !== undefined) {
          currentDomain = l;
        }
        setDomain(currentDomain);
      })
      .catch((err) => logger.error(err))
      .finally(() => setIsDomainLoaded(true));
  }, []);

  return {
    isDomainLoaded,
    domain,
  };
}

interface Domain {
  domain: NonNullable<string>;
  setDomain: (domain: NonNullable<string>) => Promise<void>;
}

const DomainContext = createContext<Domain>(undefined as any);

export function useDomainContext(): Domain {
  return useContext(DomainContext);
}

export function DomainProvider(
  props: DomainContextI & PropsWithChildren<any>
): JSX.Element | null {
  const { api } = props;
  const { domain } = useDomain({ api });
  const [currentDomain, setCurrentDomain] =
    useState<NonNullable<string>>(domain);

  useEffect(() => {
    setCurrentDomain(domain);
  }, [domain]);

  useEffect(() => {
    switch (currentDomain) {
      case "EVM":
        setDomain("EVM");
        break;
      default:
        setDomain("DFI");
    }
  }, [currentDomain]);

  const setDomain = async (domain: string): Promise<void> => {
    setCurrentDomain(domain);
    await api.set(domain);
  };

  const context: Domain = {
    domain: currentDomain,
    setDomain,
  };

  return (
    <DomainContext.Provider value={context}>
      {props.children}
    </DomainContext.Provider>
  );
}
