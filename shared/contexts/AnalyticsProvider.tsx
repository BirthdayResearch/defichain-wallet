import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

interface AnalyticsContextType {
  isAnalyticsOn: boolean;
  toggleAnalytics: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

export function AnalyticsProvider(props: PropsWithChildren<any>) {
  const [isAnalyticsOn, setIsAnalyticsOn] = useState<boolean>(true);

  const toggleAnalytics = () => {
    setIsAnalyticsOn((prevState) => !prevState);
  };

  const value: AnalyticsContextType = {
    isAnalyticsOn,
    toggleAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {props.children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  return useContext(AnalyticsContext);
};
