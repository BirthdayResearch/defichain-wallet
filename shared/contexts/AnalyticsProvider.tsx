import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getStorageItem,
  setStorageItem,
} from "@api/persistence/analytics_storage";

interface AnalyticsContextType {
  isAnalyticsOn?: string;
  getStorage: (key: string) => string | undefined;
  setStorage: (key: string, value: string | null) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>(undefined as any);

export const useAnalytics = (): AnalyticsContextType => {
  return useContext(AnalyticsContext);
};

export function AnalyticsProvider(props: PropsWithChildren<any>) {
  const [isAnalyticsOn, setIsAnalyticsOn] = useState<string>();
  // const [hasAnalyticsModalBeenShown, setHasAnalyticsModalBeenShown] =
  //   useState<boolean>(false);

  useEffect(() => {
    const transferAmountKeyStorage =
      getStorageItem<string>("ANALYTICS") ?? undefined;

    setIsAnalyticsOn(transferAmountKeyStorage);
  }, []);

  const context: AnalyticsContextType = useMemo(() => {
    const setStorage = (value: string) => {
      setIsAnalyticsOn(value);
      setStorageItem("ANALYTICS", value);
    };

    const getStorage = () => {
      return isAnalyticsOn;
    };
    return {
      isAnalyticsOn: isAnalyticsOn === null ? undefined : isAnalyticsOn,
      getStorage,
      setStorage,
    };
  }, [isAnalyticsOn]);

  return (
    <AnalyticsContext.Provider value={context}>
      {props.children}
    </AnalyticsContext.Provider>
  );
}
