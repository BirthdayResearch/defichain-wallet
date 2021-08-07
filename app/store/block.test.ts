import { block, BlockState } from './block';

describe('block reducer', () => {
  let initialState: BlockState;

  beforeEach(() => {
    initialState = {
      count: 77
    };
  })

  it('should handle initial state', () => {
    expect(block.reducer(undefined, { type: 'unknown' })).toEqual({
      count: undefined
    });
  });

  it('should handle updateBlock', () => {
    const payload = { count: 99 }
    const actual = block.reducer(initialState, block.actions.updateBlock(payload));
    expect(actual).toStrictEqual(payload)
  });
})
