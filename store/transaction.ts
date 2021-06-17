import { WhaleApiClient } from '@defichain/whale-api-client'
import { AddressActivity } from '@defichain/whale-api-client/dist/api/address'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { deepInsertOrOverwrite } from './lib'

export type AsyncState = 'initial' | 'idle' | 'loading' | 'error'
export interface PaginatedListing<T> {
  status: AsyncState
  data: T[]
}

const initialState: PaginatedListing<AddressActivity> = {
  status: 'initial',
  data: []
}

export const fetchTransactionsAsync = createAsyncThunk(
  'transaction/fetch',
  async (arg: { whaleApiClient: WhaleApiClient, address: string }) =>
    await arg.whaleApiClient.address.listTransaction(arg.address, 2)

)

export const transaction = createSlice({
  name: 'transaction',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setLoadingStatus: (state, action: PayloadAction<AsyncState>) => {
      state.status = action.payload
    },
    setTxs: (state, action: PayloadAction<AddressActivity[]>) => {
      state.data = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // list utxos
      .addCase(fetchTransactionsAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTransactionsAsync.fulfilled, (state, action) => {
        state.status = 'idle'
      })
      .addCase(fetchTransactionsAsync.rejected, (state, action) => {
        deepInsertOrOverwrite(state, {
          status: 'error'
        })
      })
  }
})
