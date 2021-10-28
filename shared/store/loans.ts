import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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

export interface LoanScheme {
  id: string
  minColRatio: string
  interestRate: string
}

export interface LoanToken {
  tokenId: string
  token: TokenData
  interest: string
  fixedIntervalPriceId: string
}

export interface CollateralToken {
  token: string
  factor: BigNumber
  priceFeedId: string
  activateAfterBlock: BigNumber
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

export const loans = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    setVaults: (state, action: PayloadAction<LoanVault[]>) => {
      state.vaults = action.payload
    },
    setLoanTokens: (state, action: PayloadAction<LoanToken[]>) => {
      state.loanTokens = action.payload
    },
    setLoanSchemes: (state, action: PayloadAction<LoanScheme[]>) => {
      state.loanSchemes = action.payload
    },
    setCollateralTokens: (state, action: PayloadAction<CollateralToken[]>) => {
      state.collateralTokens = action.payload
    },
    setAuctions: (state, action: PayloadAction<AuctionDetail[]>) => {
      state.auctions = action.payload
    }
  }
})
