import { Account, FutureData, GetFutureInfo } from '@defichain/jellyfish-api-core/dist/category/account'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FutureSwapState {
  futureSwaps: FutureData[]
}

const initialState: FutureSwapState = {
  futureSwaps: []
}

export const fetchFutureSwaps = createAsyncThunk(
  'wallet/fetchFutureSwaps',
  async ({ account, address }: { account: Account, address: string }) => {
    return await account.getPendingFutureSwaps(address)
  }
)

export const futureSwaps = createSlice({
  name: 'futureSwaps',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFutureSwaps.fulfilled, (state, action: PayloadAction<GetFutureInfo>) => {
      state.futureSwaps = action.payload.values
    })
  }
})
