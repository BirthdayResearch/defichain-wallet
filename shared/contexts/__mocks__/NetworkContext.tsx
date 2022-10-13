export const useNetworkContext = (): {
  network: string;
  networkName: string;
} => {
  return {
    network: "Playground",
    networkName: "regtest",
  };
};
