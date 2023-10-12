import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAddressFromDST20TokenId } from "@screens/AppNavigator/screens/Portfolio/hooks/EvmTokenBalances";
import { EnvironmentNetwork, isPlayground } from "@waveshq/walletkit-core";
import { ethers, providers } from "ethers";
import DST20V1 from "@shared-contracts/DST20V1.json";

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
    provider,
  }: {
    network: EnvironmentNetwork;
    evmAddress: string;
    provider: providers.JsonRpcProvider;
  }) => {
    // If playground then use rpc calls
    if (isPlayground(network)) {
      const balance = await provider.getBalance(evmAddress);
      return {
        coin_balance: balance.toString(),
      };
    }
    const url = getBlockscoutUrl(network);
    const response = await fetch(`${url}/api/v2/addresses/${evmAddress}`);
    const data = await response.json();
    if (data.message === "Not found") {
      return {};
    }
    return await response.json();
  },
);

export const fetchEvmTokenBalances = createAsyncThunk(
  "wallet/fetchEvmTokenBalances",
  async ({
    network,
    evmAddress,
    provider,
    tokenIds,
  }: {
    network: EnvironmentNetwork;
    evmAddress: string;
    provider: providers.JsonRpcProvider;
    tokenIds: string[];
  }) => {
    // If playground then use rpc calls
    if (isPlayground(network)) {
      const tokens = tokenIds.map(async (id) => {
        const address = getAddressFromDST20TokenId(id);
        const contract = new ethers.Contract(address, DST20V1.abi, provider);
        const balance = await contract.balanceOf(evmAddress);
        const decimals = await contract.decimals();
        return {
          token: {
            decimals,
            address,
          },
          value: balance.toString(),
        };
      });
      const res = await Promise.all(tokens);
      return res.filter((each) => each.value !== "0");
    }

    const url = getBlockscoutUrl(network);
    const response = await fetch(
      `${url}/api/v2/addresses/${evmAddress}/token-balances`,
    );
    const data = await response.json();
    if (data.message === "Not found") {
      return [];
    }
    return data;
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

export const getEthRpcUrl = (network: EnvironmentNetwork) => {
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
