import { getActivePrice } from './ActivePrice'

describe('Active Price', () => {
  it('should return a fixed DUSD price regardless of activePrice', () => {
    let price = getActivePrice('DUSD')
    expect(price).toStrictEqual('1')
    const mockDUSDActivePrice = {
      id: 'custom_DUSD',
      key: 'custom_DUSD',
      sort: '',
      isLive: true,
      block: {
        hash: '',
        height: 0,
        time: 0,
        medianTime: 0
      },
      active: {
        amount: '1',
        weightage: 1,
        oracles: {
          active: 1,
          total: 1
        }
      },
      next: {
        amount: '1',
        weightage: 1,
        oracles: {
          active: 1,
          total: 1
        }
      }
    }
    price = getActivePrice('DUSD', mockDUSDActivePrice)
    expect(price).toStrictEqual('1')
  })

  it('should return active price for other tokens', () => {
    const mockBTCActivePrice = {
      id: 'BTC-USD-2916',
      key: 'BTC-USD',
      isLive: true,
      block: {
        hash: '547c8115caf4a3a74aafe6b7db1f7c2d0b95c45d90fea52f3e683c02017d4cf6',
        height: 2916,
        medianTime: 1643858732,
        time: 1643858738
      },
      active: {
        amount: '50.00000000',
        weightage: 3,
        oracles: {
          active: 3,
          total: 3
        }
      },
      next: {
        amount: '50.00000000',
        weightage: 3,
        oracles: {
          active: 3,
          total: 3
        }
      },
      sort: '00000b64'
    }
    const price = getActivePrice('BTC', mockBTCActivePrice)
    expect(price).toStrictEqual('50.00000000')
  })

  it('should return 0 for other tokens without activePrice', () => {
    const price = getActivePrice('BTC')
    expect(price).toStrictEqual('0')
  })
})
