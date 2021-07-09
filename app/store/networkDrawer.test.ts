import { networkDrawer, NetworkDrawerState } from './networkDrawer'

describe('networkDrawer reducer', () => {
  let initialState: NetworkDrawerState

  beforeEach(() => {
    initialState = {
      isOpen: false,
      isLoading: false,
      title: 'Loading...',
      height: 49
    }
  })

  it('should handle initial state', () => {
    expect(networkDrawer.reducer(undefined, { type: 'unknown' })).toEqual({
      isOpen: false,
      isLoading: false,
      title: 'Loading...',
      height: 49
    });
  })

  it('should handle complete values openNetworkDrawer', () => {
    const payload: NetworkDrawerState = {
      isOpen: true,
      isLoading: true,
      title: 'Sending...',
      txid: '1iajwdoiawodij2qoi3jo2i3jo21i3u21938210938021ddwwadaw',
      height: 500
    }
    const actual = networkDrawer.reducer(initialState, networkDrawer.actions.openNetworkDrawer(payload));
    expect(actual).toStrictEqual(payload)
  })

  it('should handle partial values openNetworkDrawer', () => {
    const actual = networkDrawer.reducer(initialState, networkDrawer.actions.openNetworkDrawer({}));
    expect(actual).toStrictEqual({ isOpen: false, isLoading: false, title: 'Loading...', height: 49 })
  })
})
