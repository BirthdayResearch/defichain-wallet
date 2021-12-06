import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultLiquidated } from '@defichain/whale-api-client/dist/api/loan'
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@store/index'

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
  async ({
    size = 200,
    client
  }: { size?: number, client: WhaleApiClient }) => {
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

export const auctionsCountSelector = createSelector((state: RootState) => state.auctions.auctions, (auctions) => {
    let count = 0
    auctions?.forEach((auction) => {
      count = count + (auction.batchCount ?? 0)
    })
    return count
  }
)
