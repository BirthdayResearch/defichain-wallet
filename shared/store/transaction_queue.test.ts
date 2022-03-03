import { DfTxSigner, first, hasTxQueued, TransactionQueue, transactionQueue } from './transaction_queue'

describe('transaction reducer', () => {
  let initialState: TransactionQueue

  beforeEach(() => {
    initialState = {
      transactions: [],
      err: undefined
    }
  })

  it('should handle initial state', () => {
    expect(transactionQueue.reducer(undefined, { type: 'unknown' })).toEqual({
      transactions: []
    })
  })

  it('should handle push and pop', () => {
    const payload: DfTxSigner = {
      sign: null as any,
      title: 'Sample Transaction'
    }
    const actual = transactionQueue.reducer(initialState, transactionQueue.actions.push(payload))
    expect(actual).toStrictEqual({ transactions: [payload], err: undefined })
    const pop = transactionQueue.reducer(initialState, transactionQueue.actions.pop())
    expect(pop).toStrictEqual({ transactions: [], err: undefined })
  })

  it('should able to select first and check queue transaction', () => {
    const payload: DfTxSigner = {
      sign: null as any,
      title: 'Sample Transaction'
    }
    const hasQueue = hasTxQueued({
      ...initialState,
      transactions: [payload]
    })
    expect(hasQueue).toStrictEqual(true)
    const actual = first({
      ...initialState,
      transactions:
        [payload]
    })
    expect(actual).toStrictEqual(payload)
  })
})
