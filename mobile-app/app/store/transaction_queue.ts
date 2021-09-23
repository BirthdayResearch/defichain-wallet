import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DfTxSigner {
  sign: (account: WhaleWalletAccount) => Promise<CTransactionSegWit>
  title?: string
  description?: string
  postAction?: () => any
}

export interface TransactionQueue {
  transactions: DfTxSigner[]
}

const initialState: TransactionQueue = {
  transactions: []
}

export type CompositeDfTxSigner = DfTxSigner[]
export interface JobQueue {
  jobs: CompositeDfTxSigner[]
}
const initialJobQueue: JobQueue = {
  jobs: []
}

export const transactionQueue = createSlice({
  name: 'tx_queue',
  initialState,
  reducers: {
    push: (state, action: PayloadAction<DfTxSigner>) => {
      state.transactions = [...state.transactions, action.payload]
    },
    pop: (state) => {
      state.transactions.shift()
      state.transactions = [...state.transactions]
    }
  }
})

export const jobQueue = createSlice({
  name: 'comp_tx_queue',
  initialState: initialJobQueue,
  reducers: {
    push: (state, action: PayloadAction<CompositeDfTxSigner>) => {
      state.jobs = [...state.jobs, action.payload]
    },
    pop: (state) => {
      state.jobs.shift()
      state.jobs = [...state.jobs]
    }
  }
})

export const first = createSelector((state: TransactionQueue) => state.transactions, (transactions) => transactions[0])
export const hasTxQueued = createSelector((state: TransactionQueue) => state.transactions, (transactions) => transactions.length > 0)
export const firstJob = createSelector((state: JobQueue) => state.jobs, (jobs) => jobs[0])
