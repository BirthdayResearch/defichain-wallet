import BigNumber from 'bignumber.js'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultLiquidated, LoanVaultLiquidationBatch } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { debounce } from 'lodash'

export interface AuctionsState {
  auctions: LoanVaultLiquidated[]
  hasFetchAuctionsData: boolean
}

export interface AuctionBatchProps extends LoanVaultLiquidationBatch {
  auction: LoanVaultLiquidated
}

const initialState: AuctionsState = {
  auctions: [],
  hasFetchAuctionsData: false
}

export const fetchAuctions = createAsyncThunk(
  'wallet/fetchAuctions',
  debounce(async ({
    size = 200,
    client
  }: { size?: number, client: WhaleApiClient }) => {
    return await client.loan.listAuction(size)
  })
)

export const auctions = createSlice({
  name: 'auctions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAuctions.fulfilled, (state, action: PayloadAction<LoanVaultLiquidated[] | undefined>) => {
      if (action.payload === undefined) {
        return
      }
      state.auctions = action.payload
      state.hasFetchAuctionsData = true
    })
  }
})

/**
 * Flattens the auctions -> batch
 * Filters by search term
 * Sorts by liquidation height
 */
 export const auctionsSearchByTermSelector = createSelector([
  (state: AuctionsState) => state.auctions,
  (_state: AuctionsState, searchTerm: string) => searchTerm
  ],
  (auctions, searchTerm: string) => {
    return auctions
    .reduce<AuctionBatchProps[]>((auctionBatches, auction): AuctionBatchProps[] => {
      const filteredAuctionBatches = auctionBatches
      if (searchTerm === '' || searchTerm === undefined) {
        auction.batches.forEach(batch => {
          filteredAuctionBatches.push({
            ...batch, auction
          })
        })
      } else {
        auction.batches.forEach(batch => {
        if (batch.loan.displaySymbol.toLowerCase().includes(searchTerm.trim().toLowerCase())) {
            filteredAuctionBatches.push({
              ...batch, auction
            })
          }
        })
      }

      return filteredAuctionBatches
    }, [])
    .sort((a, b) => new BigNumber(a.auction.liquidationHeight).minus(b.auction.liquidationHeight).toNumber())
  }
)
