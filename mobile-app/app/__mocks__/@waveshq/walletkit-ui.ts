export const useNetworkContext = (): {
  network: string;
  networkName: string;
} => {
  return {
    network: "Playground",
    networkName: "regtest",
  };
};

export const useThemeContext = (): { isLight: boolean; theme: string } => {
  return {
    theme: "light",
    isLight: true,
  };
};

export const useServiceProviderContext = (): {
  url: string;
  isCustomUrl: boolean;
} => {
  return {
    url: "http://localhost:19553",
    isCustomUrl: false,
  };
};
