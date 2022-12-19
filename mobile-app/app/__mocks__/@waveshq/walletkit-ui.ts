export const useLanguageContext = (): { language: string } => {
  return {
    language: "en",
  };
};

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
