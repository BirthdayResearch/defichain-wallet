import { SecuredStoreAPI } from "@api";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";

interface EvmWalletDetails {
  hash: string;
  name: string;
  coin_balance: string;
  exchange_rate: string;
  implementation_address: string;
  block_number_balance_updated_at: number;
  creator_address_hash: string;
  creation_tx_hash: string;
}

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

interface EvmState {
  evmWalletDetails: EvmWalletDetails | null;
  evmTokenBalances: EvmTokenBalance[];
}

const initialState: EvmState = {
  evmWalletDetails: null,
  evmTokenBalances: [],
};

export const fetchEvmWalletDetails = createAsyncThunk(
  "wallet/fetchEvmWalletDetails",
  async ({
    network,
    evmAddress,
  }: {
    network: EnvironmentNetwork;
    evmAddress: string;
  }) => {
    const url = getBlockscoutUrl(network);
    const response = await fetch(`${url}/api/v2/addresses/${evmAddress}`);
    return await response.json();
  },
);

export const fetchEvmTokenBalances = createAsyncThunk(
  "wallet/fetchEvmTokenBalances",
  async ({
    network,
    evmAddress,
  }: {
    network: EnvironmentNetwork;
    evmAddress: string;
  }) => {
    const url = getBlockscoutUrl(network);
    const response = await fetch(
      `${url}/api/v2/addresses/${evmAddress}/token-balances`,
    );
    return await response.json();
  },
);

export const evm = createSlice({
  name: "evm",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchEvmWalletDetails.fulfilled,
      (state, action: PayloadAction<EvmWalletDetails>) => {
        state.evmWalletDetails = action.payload;
      },
    );
    builder.addCase(
      fetchEvmTokenBalances.fulfilled,
      (state, action: PayloadAction<EvmTokenBalance[]>) => {
        state.evmTokenBalances = action.payload;
      },
    );
  },
});

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
