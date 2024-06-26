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
  hasAnalyticsModalBeenShown?: string;
  getStorage: (key: string) => string | undefined;
  setStorage: (key: string, value: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>(undefined as any);

export const useAnalytics = (): AnalyticsContextType => {
  return useContext(AnalyticsContext);
};

export function AnalyticsProvider(props: PropsWithChildren<any>) {
  const [isAnalyticsOn, setIsAnalyticsOn] = useState<string>("true");
  const [hasAnalyticsModalBeenShown, setHasAnalyticsModalBeenShown] =
    useState<string>("false");

  const setAnalyticsValue = async () => {
    const isAnalyticsOnKeyStorage =
      await getStorageItem<string>("IS_ANALYTICS_ON");
    if (isAnalyticsOnKeyStorage) {
      setIsAnalyticsOn(isAnalyticsOnKeyStorage);
    }

    const hasAnalyticsModalBeenShownKeyStorage = await getStorageItem<string>(
      "IS_ANALYTICS_MODAL_SHOWN",
    );
    if (hasAnalyticsModalBeenShownKeyStorage) {
      setHasAnalyticsModalBeenShown(hasAnalyticsModalBeenShownKeyStorage);
    }
  };

  useEffect(() => {
    setAnalyticsValue();
  }, []);

  const context: AnalyticsContextType = useMemo(() => {
    const setStorage = (key: string, value: string) => {
      if (key === "IS_ANALYTICS_ON") {
        setIsAnalyticsOn(value);
        setStorageItem(key, value);
      } else if (key === "IS_ANALYTICS_MODAL_SHOWN") {
        setHasAnalyticsModalBeenShown(value);
        setStorageItem(key, value);
      }
    };

    const getStorage = (key: string) => {
      let value;
      if (key === "IS_ANALYTICS_ON") {
        value = isAnalyticsOn;
      } else if (key === "IS_ANALYTICS_MODAL_SHOWN") {
        value = hasAnalyticsModalBeenShown;
      }
      return value;
    };
    return {
      isAnalyticsOn: isAnalyticsOn === null ? undefined : isAnalyticsOn,
      hasAnalyticsModalBeenShown:
        hasAnalyticsModalBeenShown === null
          ? undefined
          : hasAnalyticsModalBeenShown,
      getStorage,
      setStorage,
    };
  }, [hasAnalyticsModalBeenShown, isAnalyticsOn]);

  return (
    <AnalyticsContext.Provider value={context}>
      {props.children}
    </AnalyticsContext.Provider>
  );
}
