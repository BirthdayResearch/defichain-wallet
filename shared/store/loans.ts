import { WhaleApiClient } from '@defichain/whale-api-client'
import { CollateralToken, LoanScheme, LoanToken, LoanVaultActive, LoanVaultLiquidated } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

// TODO (Harsh) interface is not yet finalized, need to update
export type LoanVault = LoanVaultActive | LoanVaultLiquidated

export interface AuctionDetail {
  vaultId: string
  batchCount: BigNumber
  liquidationPenalty: BigNumber
  liquidationHeight: BigNumber
  batches: AuctionBatchDetails[]
}

interface AuctionBatchDetails {
  index: BigNumber
  collaterals: string[]
  loan: string
}

interface LoansState {
  vaults: LoanVault[]
  loanTokens: LoanToken[]
  loanSchemes: LoanScheme[]
  collateralTokens: CollateralToken[]
  auctions: AuctionDetail[]
}

const initialState: LoansState = {
  vaults: [],
  loanTokens: [],
  loanSchemes: [],
  collateralTokens: [],
  auctions: []
}

// TODO (Harsh) Manage pagination for all api
export const fetchVaults = createAsyncThunk(
  'wallet/fetchVaults',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    const vaults = await client.loan.listVault(size)
    return vaults
  }
)

export const fetchLoanTokens = createAsyncThunk(
  'wallet/fetchLoanTokens',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    const tokens = await client.loan.listLoanToken(size)
    return tokens
  }
)

export const fetchLoanSchemes = createAsyncThunk(
  'wallet/fetchLoanSchemes',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    const schemes = await client.loan.listScheme(size)
    return schemes
  }
)

export const fetchCollateralTokens = createAsyncThunk(
  'wallet/fetchCollateralTokens',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    const tokens = await client.loan.listCollateralToken(size)
    return tokens
  }
)

export const fetchAuctions = createAsyncThunk(
  'wallet/fetchAuctions',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    // @ts-expect-error
    const auctions = await client.loan.listAuctions(size)
    return auctions
  }
)

export const loans = createSlice({
  name: 'loans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVaults.fulfilled, (state, action: PayloadAction<LoanVault[]>) => {
      state.vaults = action.payload
    })
    builder.addCase(fetchLoanTokens.fulfilled, (state, action: PayloadAction<LoanToken[]>) => {
      state.loanTokens = action.payload
    })
    builder.addCase(fetchLoanSchemes.fulfilled, (state, action: PayloadAction<LoanScheme[]>) => {
      state.loanSchemes = action.payload
    })
    builder.addCase(fetchCollateralTokens.fulfilled, (state, action: PayloadAction<CollateralToken[]>) => {
      state.collateralTokens = action.payload
    })
    builder.addCase(fetchAuctions.fulfilled, (state, action: PayloadAction<AuctionDetail[]>) => {
      state.auctions = action.payload
    })
  }
})
