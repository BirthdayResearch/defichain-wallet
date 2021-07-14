import { CTransactionSegWit } from "@defichain/jellyfish-transaction";
import { SmartBuffer } from "smart-buffer";
import { isDrawerOpenSelector, networkDrawer, NetworkDrawerState } from './networkDrawer'

describe('networkDrawer reducer', () => {
  let initialState: NetworkDrawerState

  beforeEach(() => {
    initialState = {
      transactions: [],
      height: 49,
      err: undefined
    }
  })

  it('should handle initial state', () => {
    expect(networkDrawer.reducer(undefined, { type: 'unknown' })).toEqual({
      transactions: [],
      err: undefined,
      height: 49
    });
  })

  it('should handle queueTransaction and popTransaction', () => {
    const v2 = '020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff050393700500ffffffff038260498a040000001976a9143db7aeb218455b697e94f6ff00c548e72221231d88ac7e67ce1d0000000017a914dd7730517e0e4969b4e43677ff5bee682e53420a870000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000'
    const buffer = SmartBuffer.fromBuffer(Buffer.from(v2, 'hex'))
    const signed = new CTransactionSegWit(buffer)
    const payload = { title: 'Sending', broadcasted: false, signed }
    const addedTransaction = networkDrawer.reducer(initialState, networkDrawer.actions.queueTransaction(payload));
    expect(addedTransaction).toStrictEqual({ transactions: [payload], err: undefined, height: 49 })
    const actual = networkDrawer.reducer(addedTransaction, networkDrawer.actions.queueTransaction(payload));

    const pop = networkDrawer.reducer(actual, networkDrawer.actions.popTransaction());
    expect(pop).toStrictEqual({ transactions: [payload], err: undefined, height: 49 })
    const removed = networkDrawer.reducer(pop, networkDrawer.actions.popTransaction());
    expect(removed).toStrictEqual({ transactions: [payload], err: undefined, height: 49 })
  })

  it('should closeNetworkDrawer', () => {
    const actual = networkDrawer.reducer(initialState, networkDrawer.actions.closeNetworkDrawer());
    expect(actual).toStrictEqual({ transactions: [], err: undefined, height: 49 })
  })

  it('should handle setError', () => {
    const err = new Error('An error has occurred')
    const actual = networkDrawer.reducer(initialState, networkDrawer.actions.setError(err));
    expect(actual).toStrictEqual({ transactions: [], err, height: 49 })
  })

  it('should setHeight', () => {
    const actual = networkDrawer.reducer(initialState, networkDrawer.actions.setHeight(77));
    expect(actual).toStrictEqual({ transactions: [], err: undefined, height: 77 })
  })

  it('should able to check if drawer is open', () => {
    const v2 = '020000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff050393700500ffffffff038260498a040000001976a9143db7aeb218455b697e94f6ff00c548e72221231d88ac7e67ce1d0000000017a914dd7730517e0e4969b4e43677ff5bee682e53420a870000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000'
    const buffer = SmartBuffer.fromBuffer(Buffer.from(v2, 'hex'))
    const signed = new CTransactionSegWit(buffer)
    const payload = { title: 'Sending', broadcasted: false, signed }
    const withError = isDrawerOpenSelector({ ...initialState, err: new Error('An error occurred') })
    const withTransaction = isDrawerOpenSelector({ ...initialState, transactions: [payload] })
    expect(withError).toStrictEqual(true)
    expect(withTransaction).toStrictEqual(true)
  });
})
