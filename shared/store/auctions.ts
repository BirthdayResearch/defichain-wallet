import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch, LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { customDUSDActivePrice } from './loans'

interface AuctionsState {
  auctions: LoanVaultLiquidated[]
  hasFetchAuctionsData: boolean
}

const initialState: AuctionsState = {
  auctions: [],
  hasFetchAuctionsData: false
}

export const fetchAuctions = createAsyncThunk(
  'wallet/fetchAuctions',
  async ({ size = 50, client }: { size?: number, client: WhaleApiClient }) => {
    return await client.loan.listAuction(size)
  }
)

export const auctions = createSlice({
  name: 'auctions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAuctions.fulfilled, (state, action: PayloadAction<LoanVaultLiquidated[]>) => {
      state.auctions = action.payload
      state.hasFetchAuctionsData = true
    })
  }
})

export const auctionsSelector = createSelector((state: AuctionsState) => state.auctions, auctions => {
  return auctions.map(auction => {
    const modifiedBatches: LoanVaultLiquidationBatch[] = auction.batches.map(batch => {
      const modifiedCollaterals: LoanVaultTokenAmount[] = batch.collaterals.map(collateral => {
        if (collateral.symbol === 'DUSD') {
          const modifiedCollateral: LoanVaultTokenAmount = {
            ...collateral,
            activePrice: customDUSDActivePrice
          }
          return modifiedCollateral
        } else {
          return { ...collateral }
        }
      })

      const modifiedLoan = batch.loan.symbol === 'DUSD'
        ? {
          ...batch.loan,
          activePrice: customDUSDActivePrice
        }
        : { ...batch.loan }

      return {
        ...batch,
        collaterals: modifiedCollaterals,
        loan: modifiedLoan
      }
    })
    return {
      ...auction,
      batches: modifiedBatches
    }
  }) as LoanVaultLiquidated []
})
