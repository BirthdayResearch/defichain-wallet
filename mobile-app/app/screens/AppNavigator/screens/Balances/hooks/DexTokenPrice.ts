import { useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { fetchPoolPairs } from '@store/wallet'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { ActivePrice } from '@defichain/whale-api-client/dist/api/prices'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useDispatch, useSelector } from 'react-redux'
import { getActivePrice } from '@screens/AppNavigator/screens/Auctions/helpers/ActivePrice'
import { checkIfPair, findPath, GraphProps } from '@screens/AppNavigator/screens/Dex/helpers/path-finding'

interface DexTokenPrice {
  getDexTokenActivePrice: (symbol: string, activePrice?: ActivePrice) => BigNumber
  calculatePriceRates: (fromTokenSymbol: string, pairs: PoolPairData[], amount: string) => { aToBPrice: BigNumber, bToAPrice: BigNumber, estimated: BigNumber }
  getSelectedPoolPairs: (tokenASymbol: string, tokenBSymbol: string) => PoolPairData[]
}

export function useDexTokenPrice (): DexTokenPrice {
  const client = useWhaleApiClient()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)

  const graph: GraphProps[] = pairs.map(pair => {
    return {
      pairId: pair.data.id,
      a: pair.data.tokenA.symbol,
      b: pair.data.tokenB.symbol
    }
  })

  useEffect(() => {
    dispatch(fetchPoolPairs({ client }))
  }, [blockCount])

  function getDexTokenActivePrice (symbol: string, activePrice?: ActivePrice): BigNumber {
    // active price for collateralTokens
    if (activePrice !== undefined) {
      return new BigNumber(getActivePrice(symbol, activePrice))
    }
    // active price for walletTokens
    const selectedPoolPairs = getSelectedPoolPairs(symbol, 'DUSD')
    const { aToBPrice } = calculatePriceRates(symbol, selectedPoolPairs, '1')
    return aToBPrice
  }

  function getSelectedPoolPairs (tokenASymbol: string, tokenBSymbol: string): PoolPairData[] {
    // TODO - Handle cheapest path with N hops, currently this logic finds the shortest path
    const { path } = findPath(graph, tokenASymbol, tokenBSymbol)
    return path.reduce((poolPairs: PoolPairData[], token, index): PoolPairData[] => {
      const pair = pairs.find(pair => checkIfPair({
        a: pair.data.tokenA.symbol,
        b: pair.data.tokenB.symbol
      }, token, path[index + 1]))
      if ((pair == null) || index === path.length) {
        return poolPairs
      }
      return [...poolPairs, pair.data]
    }, [])
  }

  function calculatePriceRates (fromTokenSymbol: string, pairs: PoolPairData[], amount: string): { aToBPrice: BigNumber, bToAPrice: BigNumber, estimated: BigNumber} {
    let lastTokenBySymbol = fromTokenSymbol
    let lastAmount = new BigNumber(amount)
    const priceRates = pairs.reduce((priceRates, pair): { aToBPrice: BigNumber, bToAPrice: BigNumber, estimated: BigNumber } => {
      const [reserveA, reserveB] = pair.tokenB.symbol === lastTokenBySymbol ? [pair.tokenB.reserve, pair.tokenA.reserve] : [pair.tokenA.reserve, pair.tokenB.reserve]
      const [tokenASymbol, tokenBSymbol] = pair.tokenB.symbol === lastTokenBySymbol ? [pair.tokenB.symbol, pair.tokenA.symbol] : [pair.tokenA.symbol, pair.tokenB.symbol]

      const priceRateA = new BigNumber(reserveB).div(reserveA)
      const priceRateB = new BigNumber(reserveA).div(reserveB)
      // To sequentially convert the token from its last token
      const aToBPrice = tokenASymbol === lastTokenBySymbol ? priceRateA : priceRateB
      const bToAPrice = tokenASymbol === lastTokenBySymbol ? priceRateB : priceRateA
      const estimated = new BigNumber(lastAmount).times(aToBPrice)

      lastAmount = estimated
      lastTokenBySymbol = tokenBSymbol
      return {
        aToBPrice: priceRates.aToBPrice.times(aToBPrice),
        bToAPrice: priceRates.bToAPrice.times(bToAPrice),
        estimated
      }
    }, {
      aToBPrice: new BigNumber(1),
      bToAPrice: new BigNumber(1),
      estimated: new BigNumber(0)
    })

    return {
      aToBPrice: priceRates.aToBPrice,
      bToAPrice: priceRates.bToAPrice,
      estimated: priceRates.estimated
    }
  }

  return {
    getDexTokenActivePrice,
    calculatePriceRates,
    getSelectedPoolPairs
  }
}
