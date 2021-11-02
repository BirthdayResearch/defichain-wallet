import { WhaleApiClient } from '@defichain/whale-api-client'
import { CollateralToken, LoanScheme, LoanToken } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

interface LoanVaultTokenAmount {
  id: string
  amount: string
  symbol: string
  displaySymbol: string
  symbolKey: string
  name: string
}

// TODO (Harsh) interface is not yet finalized, need to update
export interface LoanVault {
  vaultId: string
  loanSchemeId: string
  ownerAddress: string

  invalidPrice: boolean
  isUnderLiquidation: boolean

  collateralValue?: string
  loanValue?: string
  currentRatio?: string
  interestValue?: string

  collateralAmounts: LoanVaultTokenAmount[]
  loanAmounts: LoanVaultTokenAmount[]
  interestAmounts: LoanVaultTokenAmount[]
}

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
  async ({ size = 50, address, client }: { size?: number, address: string, client: WhaleApiClient }) => {
    // @ts-expect-error
    const vaults = await client.loan.listVaults(address, size)
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
