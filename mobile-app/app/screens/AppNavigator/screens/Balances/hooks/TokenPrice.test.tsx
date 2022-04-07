import { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react-hooks'
import BigNumber from 'bignumber.js'
import { useTokenPrice } from './TokenPrice'
import { DexItem, wallet } from '@store/wallet'
import { block } from '@store/block'

jest.mock('@shared-contexts/NetworkContext')
jest.mock('@react-navigation/native', () => ({
  useIsFocused: jest.fn()
}))
describe('Token Price - Get Token Price (DEX)', () => {
  const getChangingPoolPairReserve = ({
    pair1ReserveA, // BTC (BTC-DFI)
    pair1ReserveB, // DFI (BTC-DFI)
    pair2ReserveA, // USDT (USDT-DFI)
    pair2ReserveB // DFI (USDT-DFI)
  }: {
    pair1ReserveA: string
    pair1ReserveB: string
    pair2ReserveA: string
    pair2ReserveB: string
  }): DexItem[] => ([{
    type: 'available',
    data: {
      id: '15',
      symbol: 'BTC-DFI',
      displaySymbol: 'dBTC-DFI',
      name: 'Playground BTC-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'BTC',
        displaySymbol: 'dBTC',
        id: '1',
        reserve: pair1ReserveA,
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: pair1ReserveB,
        blockCommission: '0'
      },
      priceRatio: {
        ab: '1',
        ba: '1'
      },
      commission: '0',
      totalLiquidity: {
        token: '2500',
        usd: '20000000'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '79b5f7853f55f762c7550dd7c734dff0a473898bfb5639658875833accc6d461',
        height: 132
      },
      apr: {
        reward: 66.8826,
        total: 66.8826,
        commission: 0
      }
    }
  },
  {
    type: 'available',
    data: {
      id: '20',
      symbol: 'USDT-DFI',
      displaySymbol: 'USDT-DFI',
      name: 'Decentralized USD-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'USDT',
        displaySymbol: 'dUSDT',
        id: '14',
        reserve: pair2ReserveA,
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: pair2ReserveB,
        blockCommission: '0'
      },
      priceRatio: {
        ab: '10',
        ba: '0.1'
      },
      commission: '0.02',
      totalLiquidity: {
        token: '2500',
        usd: '16660'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: '4b8d5ec122052cdb8e8ffad63865444a10edc396d44e52957758ef7a39b228fa',
        height: 147
      },
      apr: {
        reward: 80291.23649459783,
        total: 80291.23649459783,
        commission: 0
      }
    }
  },
  {
    type: 'available',
    data: {
      id: '16',
      symbol: 'ETH-DFI',
      displaySymbol: 'dETH-DFI',
      name: 'Playground ETH-Default Defi token',
      status: true,
      tokenA: {
        symbol: 'ETH',
        displaySymbol: 'dETH',
        id: '2',
        reserve: '100000',
        blockCommission: '0'
      },
      tokenB: {
        symbol: 'DFI',
        displaySymbol: 'DFI',
        id: '0',
        reserve: '1000',
        blockCommission: '0'
      },
      priceRatio: {
        ab: '100',
        ba: '0.01'
      },
      commission: '0',
      totalLiquidity: {
        token: '10000',
        usd: '20000000'
      },
      tradeEnabled: true,
      ownerAddress: 'mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy',
      rewardPct: '0.1',
      creation: {
        tx: 'ac61a7ee391c2beb02043e76df4cde2baa2a7778ee6a1d4ec616a0b112462231',
        height: 147
      },
      apr: {
        reward: 66.8826,
        total: 66.8826,
        commission: 0
      }
    }
  }
  ])

  const initialState = {
    wallet: {
      utxoBalance: '77',
      tokens: [],
      allTokens: {
        dTSLA: {
          id: '17',
          symbol: 'TSLA',
          symbolKey: 'TSLA',
          name: '',
          decimal: 8,
          limit: '0',
          mintable: true,
          tradeable: true,
          isDAT: true,
          isLPS: false,
          isLoanToken: true,
          finalized: false,
          minted: '0',
          creation: {
            tx: '3a7e97db4b913fd249da2a59f2edd84f34e111fe1c775a01addfb3b96c147d40',
            height: 151
          },
          destruction: {
            tx: '0000000000000000000000000000000000000000000000000000000000000000',
            height: -1
          },
          collateralAddress: 'bcrt1qyrfrpadwgw7p5eh3e9h3jmu4kwlz4prx73cqny',
          displaySymbol: 'dTSLA'
        }
      },
      poolpairs: getChangingPoolPairReserve({
        pair1ReserveA: '5',
        pair1ReserveB: '1000',
        pair2ReserveA: '8300',
        pair2ReserveB: '100'
      }),
      swappableTokens: {},
      hasFetchedPoolpairData: false,
      hasFetchedToken: true,
      hasFetchedSwappableTokens: false
    }
  }

  const wrapper = ({ children }: { children: ReactElement }): JSX.Element => {
    const store = configureStore({
      preloadedState: initialState,
      reducer: { wallet: wallet.reducer, block: block.reducer }
    })

    return (
      <Provider store={store}>{children}</Provider>
    )
  }

  it('should be able to calculate price rates', () => {
    const { result } = renderHook(() => useTokenPrice(), { wrapper })

    expect(result.current.calculatePriceRates(
      'BTC',
      result.current.getArbitraryPoolPair('BTC', 'USDT'), new BigNumber('2')))
      .toStrictEqual({
        aToBPrice: new BigNumber('16600'), // (1000 / 5) * (8300 / 100)
        bToAPrice: new BigNumber('0.00006024096385542168675'), // (5 / 1000) * (100 / 8300)
        estimated: new BigNumber('33200') // 2 * (1000 / 5) * (8300 / 100)
      })

    expect(result.current.calculatePriceRates(
      'BTC',
      result.current.getArbitraryPoolPair('BTC', 'USDT'), new BigNumber('1')))
      .toStrictEqual({
        aToBPrice: new BigNumber('16600'), // (1000 / 5) * (8300 / 100)
        bToAPrice: new BigNumber('0.00006024096385542168675'), // (5 / 1000) * (100 / 8300)
        estimated: new BigNumber('16600') // 1 * (1000 / 5) * (8300 / 100)
      })
  })

  it('should be able to get the token price', () => {
    const { result } = renderHook(() => useTokenPrice(), { wrapper })

    // DFI / BTC * USDT / DFI (reserve)
    // (1000 / 5) * (8300 / 100)
    expect(result.current.getTokenPrice('BTC', new BigNumber('1'), false)).toStrictEqual(new BigNumber('16600'))

    // DFI / ETH * USDT / DFI (reserve)
    // (1000 / 100000) * (8300 / 100)
    expect(result.current.getTokenPrice('ETH', new BigNumber('1'), false)).toStrictEqual(new BigNumber('0.83'))
  })
})
