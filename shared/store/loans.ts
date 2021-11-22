import { WhaleApiClient } from '@defichain/whale-api-client'
import { CollateralToken, LoanScheme, LoanToken, LoanVaultActive, LoanVaultLiquidated, LoanVaultState } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'

export type LoanVault = LoanVaultActive | LoanVaultLiquidated

interface LoansState {
  vaults: LoanVault[]
  loanTokens: LoanToken[]
  loanSchemes: LoanScheme[]
  collateralTokens: CollateralToken[]
  hasFetchedVaultsData: boolean
  hasFetchedLoansData: boolean
  auctions: LoanVaultLiquidated[]
}

const initialState: LoansState = {
  vaults: [],
  loanTokens: [],
  loanSchemes: [],
  collateralTokens: [],
  hasFetchedVaultsData: false,
  hasFetchedLoansData: false,
  auctions: []
}

// TODO (Harsh) Manage pagination for all api
export const fetchVaults = createAsyncThunk(
  'wallet/fetchVaults',
  async ({ size = 50, address, client }: { size?: number, address: string, client: WhaleApiClient }) => {
    return await client.address.listVault(address, size)
  }
)

export const fetchLoanTokens = createAsyncThunk(
  'wallet/fetchLoanTokens',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    return await client.loan.listLoanToken(size)
  }
)

export const fetchLoanSchemes = createAsyncThunk(
  'wallet/fetchLoanSchemes',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    return await client.loan.listScheme(size)
  }
)

export const fetchCollateralTokens = createAsyncThunk(
  'wallet/fetchCollateralTokens',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    return await client.loan.listCollateralToken(size)
  }
)

export const fetchAuctions = createAsyncThunk(
  'wallet/fetchAuctions',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    const vault: LoanVaultLiquidated[] = [
      {
        vaultId: 'fef7d5120a6d944e8ea501a285d468ee20e13f6b179143cf42a74ec7c786ec38',
        loanScheme: {
          id: '1',
          minColRatio: '150',
          interestRate: '0.5'
        },
        ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
        state: LoanVaultState.IN_LIQUIDATION,
        liquidationHeight: 500,
        liquidationPenalty: 5,
        batchCount: 0,
        batches: [{
          index: 0,
          collaterals: [{
            id: '0',
            amount: '10000',
            symbol: 'DFI',
            displaySymbol: 'DFI',
            symbolKey: 'DFI',
            name: 'DeFiChain'
          //   activePrice:  {
          //     id: string;
          //     key: string;
          //     sort: string;
          //     active?: {
          //         amount: string;
          //         weightage: number;
          //         oracles: {
          //             active: number;
          //             total: number;
          //         };
          //     };
          //     next?: {
          //         amount: string;
          //         weightage: number;
          //         oracles: {
          //             active: number;
          //             total: number;
          //         };
          //     };
          //     isLive: boolean;
          //     block: {
          //         hash: string;
          //         height: number;
          //         time: number;
          //         medianTime: number;
          //     };
          // }
          }, {
            id: '1',
            amount: '0.00001',
            symbol: 'BTC',
            displaySymbol: 'BTC',
            symbolKey: 'BTC',
            name: 'Bitcoin'
            // activePrice: '30000.1'
          }],
          loan: {
            id: '0',
            amount: '10000',
            symbol: 'DFI',
            displaySymbol: 'DFI',
            symbolKey: 'DFI',
            name: 'DeFiChain'
            // activePrice: '3.1'
          }
        }, {
          index: 1,
          collaterals: [{
            id: '0',
            amount: '10000',
            symbol: 'DFI',
            displaySymbol: 'DFI',
            symbolKey: 'DFI',
            name: 'DeFiChain'
            // activePrice: '3.1'
          }, {
            id: '1',
            amount: '0.00001',
            symbol: 'BTC',
            displaySymbol: 'BTC',
            symbolKey: 'BTC',
            name: 'Bitcoin'
            // activePrice: '30000.1'
          }],
          loan: {
            id: '0',
            amount: '10000',
            symbol: 'DFI',
            displaySymbol: 'DFI',
            symbolKey: 'DFI',
            name: 'DeFiChain'
            // activePrice: '3.1'
          }
        }

      ]
    }]
    return vault // await client.address.listAuction(size)
  }
)

export const loans = createSlice({
  name: 'loans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVaults.fulfilled, (state, action: PayloadAction<LoanVault[]>) => {
      state.vaults = action.payload
      state.hasFetchedVaultsData = true
    })
    builder.addCase(fetchLoanTokens.fulfilled, (state, action: PayloadAction<LoanToken[]>) => {
      state.loanTokens = action.payload
      state.hasFetchedLoansData = true
    })
    builder.addCase(fetchLoanSchemes.fulfilled, (state, action: PayloadAction<LoanScheme[]>) => {
      state.loanSchemes = action.payload
    })
    builder.addCase(fetchCollateralTokens.fulfilled, (state, action: PayloadAction<CollateralToken[]>) => {
      state.collateralTokens = action.payload
    })
    builder.addCase(fetchAuctions.fulfilled, (state, action: PayloadAction<LoanVaultLiquidated[]>) => {
      state.auctions = action.payload
    })
  }
})

export const nonLiquidatedVault = createSelector((state: LoansState) => state.vaults, vaults => {
  return vaults.filter(vault => vault.state !== LoanVaultState.IN_LIQUIDATION) as LoanVaultActive[]
})
