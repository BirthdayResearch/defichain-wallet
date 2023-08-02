import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";

// TODO: Add proper ethereum RPC URLs for each network
const getEthRpcUrl = (network: EnvironmentNetwork) => {
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
    case EnvironmentNetwork.DevNet:
      return "https://changi.dfi.team";
    case EnvironmentNetwork.TestNet:
      return "https://changi.dfi.team";
    case EnvironmentNetwork.MainNet:
    default:
      return "https://changi.dfi.team";
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

const { useGetEvmTokenBalancesMutation } = ethRpcApi;
export { useGetEvmTokenBalancesMutation };
