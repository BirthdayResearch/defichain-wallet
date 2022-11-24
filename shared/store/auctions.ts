import BigNumber from "bignumber.js";
import { WhaleApiClient } from "@defichain/whale-api-client";
import {
  LoanVaultLiquidated,
  LoanVaultLiquidationBatch,
  VaultAuctionBatchHistory,
} from "@defichain/whale-api-client/dist/api/loan";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

export interface AuctionsState {
  auctions: LoanVaultLiquidated[];
  hasFetchAuctionsData: boolean;
  bidHistory: VaultAuctionBatchHistory[];
}

export interface AuctionBatchProps extends LoanVaultLiquidationBatch {
  auction: LoanVaultLiquidated;
  collateralTokenSymbols: string[];
}

const initialState: AuctionsState = {
  auctions: [],
  hasFetchAuctionsData: false,
  bidHistory: [],
};

export const fetchAuctions = createAsyncThunk(
  "wallet/fetchAuctions",
  async ({ size = 200, client }: { size?: number; client: WhaleApiClient }) => {
    return await client.loan.listAuction(size);
  }
);

export const fetchBidHistory = createAsyncThunk(
  "wallet/fetchBidHistory",
  async ({
    vaultId,
    liquidationHeight,
    batchIndex,
    client,
    size = 200,
  }: {
    vaultId: string;
    liquidationHeight: number;
    batchIndex: number;
    client: WhaleApiClient;
    size: number;
  }) => {
    return await client.loan.listVaultAuctionHistory(
      vaultId,
      liquidationHeight,
      batchIndex,
      size
    );
  }
);

export const auctions = createSlice({
  name: "auctions",
  initialState,
  reducers: {
    resetBidHistory: (state) => {
      state.bidHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchAuctions.fulfilled,
      (state, action: PayloadAction<LoanVaultLiquidated[]>) => {
        state.auctions = action.payload;
        state.hasFetchAuctionsData = true;
      }
    );
    builder.addCase(
      fetchBidHistory.fulfilled,
      (state, action: PayloadAction<VaultAuctionBatchHistory[]>) => {
        state.bidHistory = action.payload;
      }
    );
  },
});

/**
 * Flattens the auctions -> batch
 * Sorts by liquidation height
 */
export const getAuctionBatches = createSelector(
  [(state: AuctionsState) => state.auctions],
  (auctions) => {
    return auctions.reduce<AuctionBatchProps[]>(
      (auctionBatches, auction): AuctionBatchProps[] => {
        const filteredAuctionBatches = auctionBatches;
        auction.batches.forEach((batch) => {
          filteredAuctionBatches.push({
            ...batch,
            auction,
            collateralTokenSymbols: batch.collaterals.map(
              ({ displaySymbol }) => displaySymbol
            ),
          });
        });
        return filteredAuctionBatches;
      },
      []
    );
  }
);
