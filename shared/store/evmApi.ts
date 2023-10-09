import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";

export const evmApi = createApi({
  reducerPath: "evmApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getEvmAddressDetails: builder.mutation<
      EvmAddressDetails,
      { network: EnvironmentNetwork; evmAddress: string }
    >({
      query: ({ network = EnvironmentNetwork.TestNet, evmAddress }) => ({
        url: `${getEthRpcUrl(network)}/api/v2/addresses/${evmAddress}`,
        method: "GET",
      }),
    }),
    getEvmTokenBalances: builder.mutation<
      EvmTokenBalance[],
      { network: EnvironmentNetwork; evmAddress: string }
    >({
      query: ({ network = EnvironmentNetwork.TestNet, evmAddress }) => ({
        url: `${getEthRpcUrl(
          network,
        )}/api/v2/addresses/${evmAddress}/token-balances`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetEvmAddressDetailsMutation,
  useGetEvmTokenBalancesMutation,
} = evmApi;

const getEthRpcUrl = (network: EnvironmentNetwork) => {
  // TODO: Add proper ethereum RPC URLs for each network
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
    case EnvironmentNetwork.DevNet:
      return "http://34.22.222.153:4000";
    case EnvironmentNetwork.TestNet:
      return "https://blockscout.changi.ocean.jellyfishsdk.com";
    case EnvironmentNetwork.MainNet:
    default:
      return "https://blockscout.changi.ocean.jellyfishsdk.com";
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

interface EvmAddressDetails {
  hash: string;
  name: string;
  coin_balance: string;
  exchange_rate: string;
  implementation_address: string;
  block_number_balance_updated_at: number;
  creator_address_hash: string;
  creation_tx_hash: string;
}
