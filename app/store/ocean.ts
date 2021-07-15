import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OceanTransaction {
  broadcasted: boolean
  signed: CTransactionSegWit
  title?: string
}

export interface OceanState {
  transactions: OceanTransaction[]
  height: number
  err?: Error
}

const initialState: OceanState = {
  transactions: [],
  height: 49,
  err: undefined
}

export const ocean = createSlice({
  name: 'ocean',
  initialState,
  reducers: {
    setHeight: (state, action: PayloadAction<number>) => {
      state.height = action.payload
    },
    queueTransaction: (state, action: PayloadAction<OceanTransaction>) => {
      state.transactions = [...state.transactions, action.payload]
    },
    setError: (state, action: PayloadAction<Error>) => {
      state.err = action.payload
    },
    popTransaction: (state) => {
      state.transactions.shift()
      state.transactions = [...state.transactions]
    }
  }
})

export const firstTransactionSelector = createSelector((state: OceanState) => state.transactions, (transactions) => transactions[0])

export const hasTxQueued = createSelector((state: OceanState) => state.transactions, (transactions) => transactions.length > 0)
