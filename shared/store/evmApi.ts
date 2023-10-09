import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { SecuredStoreAPI } from "@api";

export const evmApi = createApi({
  reducerPath: "evmApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getEvmAddressDetails: builder.mutation<
      EvmAddressDetails,
      { network: EnvironmentNetwork; evmAddress: string }
    >({
      query: ({ network = EnvironmentNetwork.TestNet, evmAddress }) => ({
        url: `${getBlockscoutUrl(network)}/api/v2/addresses/${evmAddress}`,
        method: "GET",
      }),
    }),
    getEvmTokenBalances: builder.mutation<
      EvmTokenBalance[],
      { network: EnvironmentNetwork; evmAddress: string }
    >({
      query: ({ network = EnvironmentNetwork.TestNet, evmAddress }) => ({
        url: `${getBlockscoutUrl(
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

const getBlockscoutUrl = (network: EnvironmentNetwork) => {
  // TODO: Add proper blockscout url for each network
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
    case EnvironmentNetwork.RemotePlayground:
    case EnvironmentNetwork.DevNet:
    case EnvironmentNetwork.Changi:
      return "http://34.87.158.111:4000"; // TODO: add final blockscout url for playground and devnet
    case EnvironmentNetwork.TestNet:
      return "https://blockscout.changi.ocean.jellyfishsdk.com";
    case EnvironmentNetwork.MainNet:
    default:
      return "https://blockscout.changi.ocean.jellyfishsdk.com";
  }
};

export const getEthRpcUrl = async () => {
  const network = await SecuredStoreAPI.getNetwork();
  // TODO: Add proper ethereum RPC URLs for each network
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
      return "http://localhost:19551";
    case EnvironmentNetwork.RemotePlayground:
    case EnvironmentNetwork.DevNet:
    case EnvironmentNetwork.Changi:
      return "http://34.34.156.49:20551"; // TODO: add final eth rpc url for changi, devnet and remote playground
    case EnvironmentNetwork.TestNet:
      return "https://changi.dfi.team"; // TODO: add final eth rpc url for testnet, with proper domain name
    case EnvironmentNetwork.MainNet:
    default:
      return "https://changi.dfi.team"; // TODO: add final eth rpc url for mainnet, with proper domain name
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
