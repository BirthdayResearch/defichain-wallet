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
  setStorage: (key: string, value: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>(undefined as any);

export const useAnalytics = (): AnalyticsContextType => {
  return useContext(AnalyticsContext);
};

export function AnalyticsProvider(props: PropsWithChildren<any>) {
  const [isAnalyticsOn, setIsAnalyticsOn] = useState<string>("true");
  // const [hasAnalyticsModalBeenShown, setHasAnalyticsModalBeenShown] =
  //   useState<boolean>(false);

  const setAnalyticsValue = async () => {
    const transferAmountKeyStorage = await getStorageItem<string>("ANALYTICS");
    if (transferAmountKeyStorage) {
      setIsAnalyticsOn(transferAmountKeyStorage);
    }
  };

  useEffect(() => {
    setAnalyticsValue();
  }, []);

  const context: AnalyticsContextType = useMemo(() => {
    const setStorage = (key: string, value: string) => {
      setIsAnalyticsOn(value);
      setStorageItem(key, value);
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
