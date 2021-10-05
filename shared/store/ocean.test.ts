import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { SmartBuffer } from 'smart-buffer'
import { ocean, OceanState, OceanTransaction } from './ocean'

describe('ocean reducer', () => {
  let initialState: OceanState

  beforeEach(() => {
    initialState = {
      transactions: [],
      height: 0,
      err: undefined
    }
  })

  it('should handle initial state', () => {
    expect(ocean.reducer(undefined, { type: 'unknown' })).toEqual({
      transactions: [],
      err: undefined,
      height: 0
    })
  })

  it('should handle queueTransaction and popTransaction', () => {
    const v2 = '020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff050393700500ffffffff038260498a040000001976a9143db7aeb218455b697e94f6ff00c548e72221231d88ac7e67ce1d0000000017a914dd7730517e0e4969b4e43677ff5bee682e53420a870000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000'
    const buffer = SmartBuffer.fromBuffer(Buffer.from(v2, 'hex'))
    const signed = new CTransactionSegWit(buffer)
    const payload: Omit<OceanTransaction, 'broadcasted'> = { title: 'Sending', tx: signed }
    const addedTransaction = ocean.reducer(initialState, ocean.actions.queueTransaction(payload))
    expect(addedTransaction).toStrictEqual({
      transactions: [{
        ...payload,
        broadcasted: false
      }],
      err: undefined,
      height: 0
    })
    const actual = ocean.reducer(addedTransaction, ocean.actions.queueTransaction(payload))

    const pop = ocean.reducer(actual, ocean.actions.popTransaction())
    expect(pop).toStrictEqual({
      transactions: [{
        ...payload,
        broadcasted: false
      }],
      err: undefined,
      height: 0
    })
    const removed = ocean.reducer(pop, ocean.actions.popTransaction())
    expect(removed).toStrictEqual({ transactions: [], err: undefined, height: 0 })
  })

  it('should handle setError', () => {
    const err = new Error('An error has occurred')
    const actual = ocean.reducer(initialState, ocean.actions.setError(err))
    expect(actual).toStrictEqual({ transactions: [], err, height: 0 })
  })

  it('should setHeight', () => {
    const actual = ocean.reducer(initialState, ocean.actions.setHeight(77))
    expect(actual).toStrictEqual({ transactions: [], err: undefined, height: 77 })
  })
})
