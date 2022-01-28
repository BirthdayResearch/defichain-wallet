import { block, BlockState } from './block'

describe('block reducer', () => {
  let initialState: BlockState
  const date = new Date().toString()

  beforeEach(() => {
    initialState = {
      count: 77,
      masternodeCount: 10,
      lastSuccessfulSync: date,
      lastSync: date,
      isPolling: false,
      connected: false,
      tvl: 1
    }
  })

  it('should handle initial state', () => {
    expect(block.reducer(undefined, { type: 'unknown' })).toEqual({
      count: undefined,
      masternodeCount: undefined,
      lastSuccessfulSync: undefined,
      connected: false,
      isPolling: false,
      tvl: undefined,
      lastSync: undefined
    })
  })

  it('should handle updateBlock', () => {
    const payload = { count: 99, masternodeCount: 0, lastSuccessfulSync: date, lastSync: date, tvl: 1 }
    const actual = block.reducer(initialState, block.actions.updateBlockDetails(payload))
    expect(actual).toStrictEqual({ ...initialState, ...payload })
  })

  it('should handle setConnected', () => {
    const actual = block.reducer(initialState, block.actions.setConnected(true))
    expect(actual).toStrictEqual({ ...initialState, count: 77, isPolling: false, connected: true })
  })

  it('should handle setPolling', () => {
    const actual = block.reducer(initialState, block.actions.setPolling(true))
    expect(actual).toStrictEqual({ ...initialState, count: 77, isPolling: true, connected: false })
  })
})
