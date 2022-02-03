import { WhaleApiClient } from '@defichain/whale-api-client'
import { CollateralToken, LoanScheme, LoanToken, LoanVaultActive, LoanVaultLiquidated } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'

export type LoanVault = LoanVaultActive | LoanVaultLiquidated

export interface LoansState {
  vaults: LoanVault[]
  loanTokens: LoanToken[]
  loanSchemes: LoanScheme[]
  collateralTokens: CollateralToken[]
  hasFetchedVaultsData: boolean
  hasFetchedLoansData: boolean
}

const initialState: LoansState = {
  vaults: [],
  loanTokens: [],
  loanSchemes: [],
  collateralTokens: [],
  hasFetchedVaultsData: false,
  hasFetchedLoansData: false
}

// TODO (Harsh) Manage pagination for all api
export const fetchVaults = createAsyncThunk(
  'wallet/fetchVaults',
  async ({ size = 200, address, client }: { size?: number, address: string, client: WhaleApiClient }) => {
    return await client.address.listVault(address, size)
  }
)

export const fetchLoanTokens = createAsyncThunk(
  'wallet/fetchLoanTokens',
  async ({ size = 200, client }: { size?: number, client: WhaleApiClient }) => {
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
  }
})

export const ascColRatioLoanScheme = createSelector((state: LoansState) => state.loanSchemes,
  (schemes) => schemes.map((c) => c).sort((a, b) => new BigNumber(a.minColRatio).minus(b.minColRatio).toNumber()))

export const loanTokensSelector = createSelector((state: LoansState) => state.loanTokens, loanTokens => {
  return loanTokens
})

const selectTokenId = (state: LoansState, tokenId: string): string => tokenId

export const loanTokenByTokenId = createSelector([selectTokenId, loanTokensSelector], (tokenId, loanTokens) => {
  return loanTokens.find(loanToken => loanToken.token.id === tokenId)
})

export const vaultsSelector = createSelector((state: LoansState) => state.vaults, vaults => {
  return vaults
})
