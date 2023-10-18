import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAddressFromDST20TokenId } from "@api/transaction/transfer_domain";
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
  hasFetchedEvmTokens: boolean;
}

const initialState: EvmState = {
  evmWalletDetails: null,
  evmTokenBalances: [],
  hasFetchedEvmTokens: false,
};

export const fetchEvmWalletDetails = createAsyncThunk(
  "wallet/fetchEvmWalletDetails",
  async ({
    evmUrl,
    network,
    evmAddress,
    provider,
  }: {
    evmUrl: string;
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
    const response = await fetch(`${evmUrl}/api/v2/addresses/${evmAddress}`);
    const data = await response.json();
    if (data.message === "Not found") {
      return {};
    }
    return data;
  },
);

export const fetchEvmTokenBalances = createAsyncThunk(
  "wallet/fetchEvmTokenBalances",
  async ({
    evmUrl,
    network,
    evmAddress,
    provider,
    tokenIds,
  }: {
    evmUrl: string;
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

    const response = await fetch(
      `${evmUrl}/api/v2/addresses/${evmAddress}/token-balances`,
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
        state.hasFetchedEvmTokens = true;
      },
    );
  },
});
