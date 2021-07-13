import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Transaction {
  broadcasted: boolean
  signed: CTransactionSegWit
  title?: string
}

export interface NetworkDrawerState {
  transactions: Transaction[]
  height: number
  err?: Error
}

const initialState: NetworkDrawerState = {
  transactions: [],
  height: 49,
  err: undefined
}

export const networkDrawer = createSlice({
  name: 'networkDrawer',
  initialState,
  reducers: {
    setHeight: (state, action: PayloadAction<number>) => {
      state.height = action.payload
    },
    queueTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions = [...state.transactions, action.payload]
    },
    closeNetworkDrawer: (state) => {
      state.transactions = []
      state.err = undefined
    },
    setError: (state, action: PayloadAction<Error>) => {
      state.err = action.payload
    },
    popTransaction: (state) => {
      if (state.transactions.length > 1) {
        state.transactions.shift()
        state.transactions = [...state.transactions]
      }
    }
  }
})

export const isDrawerOpenSelector = createSelector([(state: NetworkDrawerState) => state.transactions, (state: NetworkDrawerState) => state.err],
  (transactions, err) => transactions?.length > 0 || err !== undefined)

export const firstTransactionSelector = createSelector((state: NetworkDrawerState) => state.transactions, (transactions) => transactions[0])
