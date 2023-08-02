import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";

export const ethRpcApi = createApi({
  reducerPath: "ethRpc",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getEvmTokenBalances: builder.mutation<
      EvmTokenBalance[],
      { network: EnvironmentNetwork; address: string }
    >({
      query: ({ network = EnvironmentNetwork.TestNet, address }) => ({
        url: `${getEthRpcUrl(
          network
        )}/api/v2/addresses/${address}/token-balances`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetEvmTokenBalancesMutation } = ethRpcApi;

const getEthRpcUrl = (network: EnvironmentNetwork) => {
  // TODO: Add proper ethereum RPC URLs for each network
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
    case EnvironmentNetwork.DevNet:
      return "https://changi.ocean.jellyfishsdk.com";
    case EnvironmentNetwork.TestNet:
      return "https://changi.ocean.jellyfishsdk.com";
    case EnvironmentNetwork.MainNet:
    default:
      return "https://changi.ocean.jellyfishsdk.com";
  }
};

interface EvmToken {
  address: string;
  decimals: string;
  name: string;
  symbol: string;
  type: string;
}

interface EvmTokenBalance {
  token_id: string;
  value: string;
  token: EvmToken;
}
