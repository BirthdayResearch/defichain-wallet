import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OceanTransaction {
  broadcasted: boolean
  tx: CTransactionSegWit
  title?: string
  submitButtonLabel?: string
  onBroadcast?: () => any
  onConfirmation?: () => any
  onError?: () => any
}

export interface OceanState {
  transactions: OceanTransaction[]
  height: number
  err?: Error
}

const initialState: OceanState = {
  transactions: [],
  height: 0,
  err: undefined
}

export const ocean = createSlice({
  name: 'ocean',
  initialState,
  reducers: {
    setHeight: (state, action: PayloadAction<number>) => {
      state.height = action.payload
    },
    queueTransaction: (state, action: PayloadAction<Omit<OceanTransaction, 'broadcasted'>>) => {
      state.transactions = [...state.transactions, { ...action.payload, broadcasted: false }]
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
