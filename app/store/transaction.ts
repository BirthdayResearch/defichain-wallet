import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VMTransaction } from '../screens/AppNavigator/screens/Transactions/screens/stateProcessor'

type LoadingState = 'idle' | 'loading' | 'loadingMore' | 'success' | 'background' | 'error'

export interface TransactionState {
  transactions: VMTransaction[]
  loadingState: LoadingState
  error: string | null
  loadMoreToken: string | undefined
}

const initialState: TransactionState = {
  transactions: [],
  loadingState: 'idle',
  error: null,
  loadMoreToken: undefined
}

export const transaction = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<VMTransaction[]>) => {
      state.transactions = action.payload
      state.loadingState = 'success'
    },
    addTransactions: (state, action: PayloadAction<VMTransaction[]>) => {
      state.transactions = state.transactions.concat(action.payload)
      state.loadingState = 'success'
    },
    setLoadingState: (state, action: PayloadAction<LoadingState>) => {
      state.loadingState = action.payload
    },
    setLoadMoreToken: (state, action: PayloadAction<string | undefined>) => {
      state.loadMoreToken = action.payload
    },
    setError: (state, action: PayloadAction<any>) => {
      state.error = action.payload
    }
  }
})
