import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DfTxSigner {
  sign: (account: WhaleWalletAccount) => Promise<CTransactionSegWit>
  title?: string
  description?: string
  onBroadcast?: () => any
  onConfirmation?: () => any
  onError?: () => any
  submitButtonLabel?: string
}

export interface TransactionQueue {
  transactions: DfTxSigner[]
  err?: Error
}

const initialState: TransactionQueue = {
  transactions: [],
  err: undefined
}

export const transactionQueue = createSlice({
  name: 'tx_queue',
  initialState,
  reducers: {
    push: (state, action: PayloadAction<DfTxSigner>) => {
      state.transactions = [...state.transactions, action.payload]
      state.err = undefined
    },
    pop: (state) => {
      state.transactions.shift()
      state.transactions = [...state.transactions]
    },
    setError: (state, action: PayloadAction<Error>) => {
      state.err = action.payload
    }
  }
})

export const first = createSelector((state: TransactionQueue) => state.transactions, (transactions) => transactions[0])
export const hasTxQueued = createSelector((state: TransactionQueue) => state.transactions, (transactions) => transactions.length > 0)
