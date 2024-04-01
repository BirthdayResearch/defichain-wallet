import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

interface AnalyticsContextType {
  isAnalyticsOn: boolean;
  hasAnalyticsModalBeenShown: boolean;
  setHasAnalyticsModalBeenShown: (
    hasAnalyticsModalBeenShown: NonNullable<boolean>,
  ) => void;
  toggleAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>(undefined as any);

export function AnalyticsProvider(props: PropsWithChildren<any>) {
  const [isAnalyticsOn, setIsAnalyticsOn] = useState<boolean>(true);
  const [hasAnalyticsModalBeenShown, setHasAnalyticsModalBeenShown] =
    useState<boolean>(false);

  const toggleAnalytics = () => {
    setIsAnalyticsOn((prevState) => !prevState);
  };

  const value: AnalyticsContextType = {
    isAnalyticsOn,
    hasAnalyticsModalBeenShown,
    setHasAnalyticsModalBeenShown,
    toggleAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {props.children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = (): AnalyticsContextType => {
  return useContext(AnalyticsContext);
};
