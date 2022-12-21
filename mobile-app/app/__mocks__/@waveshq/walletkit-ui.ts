import {
  EnvironmentNetwork,
  newOceanOptions,
  newWhaleAPIClient,
} from "@waveshq/walletkit-core";

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

export const useWhaleApiClient = () => ({
  whaleAPI: newWhaleAPIClient(
    newOceanOptions(EnvironmentNetwork.RemotePlayground)
  ),
  poolpairs: {
    getBestPath: () => ({
      fromToken: {
        id: "1",
        symbol: "BTC",
        displaySymbol: "dBTC",
      },
      toToken: {
        id: "3",
        symbol: "USDT",
        displaySymbol: "dUSDT",
      },
      bestPath: [
        {
          poolPairId: "17",
          symbol: "BTC-DFI",
          tokenA: {
            id: "1",
            symbol: "BTC",
            displaySymbol: "dBTC",
          },
          tokenB: {
            id: "0",
            symbol: "DFI",
            displaySymbol: "DFI",
          },
          priceRatio: {
            ab: "1.00000000",
            ba: "1.00000000",
          },
        },
        {
          poolPairId: "19",
          symbol: "USDT-DFI",
          tokenA: {
            id: "3",
            symbol: "USDT",
            displaySymbol: "dUSDT",
          },
          tokenB: {
            id: "0",
            symbol: "DFI",
            displaySymbol: "DFI",
          },
          priceRatio: {
            ab: "10000.00000000",
            ba: "0.00010000",
          },
        },
      ],
      estimatedReturn: "10000.00000000",
      estimatedReturnLessDexFees: "1.0",
    }),
  },
});

export const useWhaleRpcClient = jest.fn();
