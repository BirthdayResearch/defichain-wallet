import { block, BlockState } from './block';

describe('block reducer', () => {
  let initialState: BlockState;

  beforeEach(() => {
    initialState = {
      count: 77,
      isPolling: false,
      connected: false
    };
  })

  it('should handle initial state', () => {
    expect(block.reducer(undefined, { type: 'unknown' })).toEqual({
      count: undefined,
      connected: false,
      isPolling: false
    });
  });

  it('should handle updateBlock', () => {
    const payload = { count: 99 }
    const actual = block.reducer(initialState, block.actions.updateBlock(payload));
    expect(actual).toStrictEqual({ ...payload, isPolling: false, connected: false })
  });

  it('should handle setConnected', () => {
    const actual = block.reducer(initialState, block.actions.setConnected(true));
    expect(actual).toStrictEqual({ count: 77, isPolling: false, connected: true })
  });

  it('should handle setPolling', () => {
    const actual = block.reducer(initialState, block.actions.setPolling(true));
    expect(actual).toStrictEqual({ count: 77, isPolling: true, connected: false })
  });
})
