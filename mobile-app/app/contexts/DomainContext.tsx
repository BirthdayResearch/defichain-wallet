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
  domain: NonNullable<DomainType>;
}

interface DomainContextI {
  api: {
    get: () => Promise<string | null>;
    set: (domain: NonNullable<string>) => Promise<void>;
  };
}

export enum DomainType {
  DVM = "DVM",
  EVM = "EVM",
}

export function useDomain({ api }: DomainContextI): DomainLoader {
  const defaultDomain = DomainType.DVM;
  const logger = useLogger();
  const [isDomainLoaded, setIsDomainLoaded] = useState<boolean>(false);
  const [domain, setDomain] = useState<NonNullable<DomainType>>(defaultDomain);

  useEffect(() => {
    api
      .get()
      .then((l) => {
        let currentDomain: NonNullable<DomainType> = defaultDomain;
        if (l !== null && l !== undefined) {
          currentDomain = l as DomainType; // TODO fix this hardcoded typing if possible
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
  domain: NonNullable<DomainType>;
  isEnabled: boolean;
  setDomain: (domain: NonNullable<DomainType>) => Promise<void>;
}

const DomainContext = createContext<Domain>(undefined as any);

export function useDomainContext(): Domain {
  return useContext(DomainContext);
}

export function DomainProvider(
  props: DomainContextI & PropsWithChildren<any>,
): JSX.Element | null {
  const isEnabled = false;
  const { api } = props;
  const { domain } = useDomain({ api });
  const [currentDomain, setCurrentDomain] =
    useState<NonNullable<DomainType>>(domain);

  useEffect(() => {
    setCurrentDomain(domain);
  }, [domain]);

  useEffect(() => {
    switch (currentDomain) {
      case "EVM":
        setDomain(DomainType.EVM);
        break;
      default:
        setDomain(DomainType.DVM);
    }
  }, [currentDomain]);

  const setDomain = async (domain: DomainType): Promise<void> => {
    setCurrentDomain(domain);
    await api.set(domain);
  };

  const context: Domain = {
    domain: isEnabled ? currentDomain : DomainType.DVM,
    isEnabled,
    setDomain,
  };

  return (
    <DomainContext.Provider value={context}>
      {props.children}
    </DomainContext.Provider>
  );
}
