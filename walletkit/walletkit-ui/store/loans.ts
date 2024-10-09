import { WhaleApiClient } from "@defichain/whale-api-client";
import {
  CollateralToken,
  LoanScheme,
  LoanToken,
  LoanVaultActive,
  LoanVaultLiquidated,
  LoanVaultState,
} from "@defichain/whale-api-client/dist/api/loan";
import { ActivePrice } from "@defichain/whale-api-client/dist/api/prices";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";

import { useVaultStatus } from "../hooks";
import { VaultStatus } from "./types";

export type LoanVault = LoanVaultActive | LoanVaultLiquidated;

export interface LoanPaymentTokenActivePrices {
  [key: string]: ActivePrice;
}

export interface LoansState {
  vaults: LoanVault[];
  loanTokens: LoanToken[];
  loanSchemes: LoanScheme[];
  collateralTokens: CollateralToken[];
  loanPaymentTokenActivePrices: LoanPaymentTokenActivePrices;
  hasFetchedVaultsData: boolean;
  hasFetchedLoansData: boolean;
  hasFetchedLoanSchemes: boolean;
}

const initialState: LoansState = {
  vaults: [],
  loanTokens: [],
  loanSchemes: [],
  collateralTokens: [],
  loanPaymentTokenActivePrices: {},
  hasFetchedVaultsData: false,
  hasFetchedLoansData: false,
  hasFetchedLoanSchemes: false,
};

// TODO (Harsh) Manage pagination for all api
export const fetchVaults = createAsyncThunk(
  "wallet/fetchVaults",
  async ({
    size = 200,
    address,
    client,
  }: {
    size?: number;
    address: string;
    client: WhaleApiClient;
  }) => client.address.listVault(address, size),
);

export const fetchLoanTokens = createAsyncThunk(
  "wallet/fetchLoanTokens",
  async ({ size = 200, client }: { size?: number; client: WhaleApiClient }) =>
    client.loan.listLoanToken(size),
);

export const fetchLoanSchemes = createAsyncThunk(
  "wallet/fetchLoanSchemes",
  async ({ size = 50, client }: { size?: number; client: WhaleApiClient }) =>
    client.loan.listScheme(size),
);

export const fetchCollateralTokens = createAsyncThunk(
  "wallet/fetchCollateralTokens",
  async ({ size = 50, client }: { size?: number; client: WhaleApiClient }) =>
    client.loan.listCollateralToken(size),
);

export const fetchPrice = createAsyncThunk(
  "wallet/fetchPrice",
  async ({
    client,
    token,
    currency,
  }: {
    token: string;
    currency: string;
    client: WhaleApiClient;
  }) => {
    const activePrices = await client.prices.getFeedActive(token, currency, 1);
    return activePrices[0];
  },
);

export const loans = createSlice({
  name: "loans",
  initialState,
  reducers: {
    setHasFetchedVaultsData: (state, action: PayloadAction<boolean>) => {
      state.hasFetchedVaultsData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchVaults.fulfilled,
      (state, action: PayloadAction<LoanVault[]>) => {
        state.vaults = action.payload;
        state.hasFetchedVaultsData = true;
      },
    );
    builder.addCase(
      fetchLoanTokens.fulfilled,
      (state, action: PayloadAction<LoanToken[]>) => {
        state.loanTokens = action.payload;
        state.hasFetchedLoansData = true;
      },
    );
    builder.addCase(
      fetchLoanSchemes.fulfilled,
      (state, action: PayloadAction<LoanScheme[]>) => {
        state.loanSchemes = action.payload;
        state.hasFetchedLoanSchemes = true;
      },
    );
    builder.addCase(
      fetchCollateralTokens.fulfilled,
      (state, action: PayloadAction<CollateralToken[]>) => {
        state.collateralTokens = action.payload;
      },
    );
    builder.addCase(
      fetchPrice.fulfilled,
      (state, action: PayloadAction<ActivePrice>) => {
        state.loanPaymentTokenActivePrices = {
          ...state.loanPaymentTokenActivePrices,
          ...{
            [action.payload.key]: action.payload,
          },
        };
      },
    );
  },
});

export const selectLoansState = (state: any): LoansState => state.loans;

export const ascColRatioLoanScheme = createSelector(
  (state: LoansState) => state.loanSchemes,
  (schemes) =>
    schemes
      .map((c) => c)
      .sort((a, b) =>
        new BigNumber(a.minColRatio).minus(b.minColRatio).toNumber(),
      ),
);

export const loanTokensSelector = createSelector(
  (state: LoansState) => state.loanTokens,
  (loanTokens) => loanTokens,
);

const selectTokenId = (state: LoansState, tokenId: string): string => tokenId;

export const loanTokenByTokenId = createSelector(
  [selectTokenId, loanTokensSelector],
  (tokenId, loanTokens) =>
    loanTokens.find((loanToken) => loanToken.token.id === tokenId),
);

export const loanPaymentTokenActivePrices = createSelector(
  (state: LoansState) => state.loanPaymentTokenActivePrices,
  (activePrices) => activePrices,
);

export const vaultsSelector = createSelector(
  (state: LoansState) => state.vaults,
  (vaults) => {
    const order = {
      [VaultStatus.NearLiquidation]: 1,
      [VaultStatus.AtRisk]: 2,
      [VaultStatus.Healthy]: 3,
      [VaultStatus.Liquidated]: 4,
      [VaultStatus.Ready]: 5,
      [VaultStatus.Halted]: 6,
      [VaultStatus.Empty]: 7,
      [VaultStatus.Unknown]: 8,
    };

    return vaults
      .map((vault) => {
        if (vault.state === LoanVaultState.IN_LIQUIDATION) {
          return {
            ...vault,
            vaultState: VaultStatus.Liquidated,
          };
        }

        const colRatio = new BigNumber(vault.collateralRatio);
        const minColRatio = new BigNumber(vault.loanScheme.minColRatio);
        const totalLoanValue = new BigNumber(vault.loanValue);
        const totalCollateralValue = new BigNumber(vault.collateralValue);
        const vaultState = useVaultStatus(
          vault.state,
          colRatio,
          minColRatio,
          totalLoanValue,
          totalCollateralValue,
        );
        return {
          ...vault,
          vaultState: vaultState.status,
        };
      })
      .sort((a, b) => order[a.vaultState] - order[b.vaultState]);
  },
);

//* Filter vaults that will be removed with Total Portfolio Amount
export const activeVaultsSelector = createSelector(
  vaultsSelector,
  (vaults) =>
    vaults.filter((value: LoanVault) =>
      [
        LoanVaultState.ACTIVE,
        LoanVaultState.MAY_LIQUIDATE,
        LoanVaultState.FROZEN,
      ].includes(value.state),
    ) as LoanVaultActive[],
);
