import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { useSelector } from 'react-redux'
import { checkIfPair, findPath, GraphProps } from '@screens/AppNavigator/screens/Dex/helpers/path-finding'
import { CacheApi } from '@api/cache'
import { useNetworkContext } from '@shared-contexts/NetworkContext'

interface CalculatePriceRatesI {
  aToBPrice: BigNumber
  bToAPrice: BigNumber
  estimated: BigNumber
}

interface TokenPrice {
  getTokenPrice: (symbol: string, amount: BigNumber, isLPS?: boolean) => BigNumber
  calculatePriceRates: (fromTokenSymbol: string, pairs: PoolPairData[], amount: BigNumber) => CalculatePriceRatesI
  getArbitraryPoolPair: (tokenASymbol: string, tokenBSymbol: string) => PoolPairData[]
}

export function useTokenPrice (): TokenPrice {
  const { network } = useNetworkContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const graph: GraphProps[] = useMemo(() => pairs.map(pair => {
    return {
      pairId: pair.data.id,
      a: pair.data.tokenA.symbol,
      b: pair.data.tokenB.symbol
    }
  }), [pairs])

  const getTokenPrice = useCallback((symbol: string, amount: BigNumber, isLPS: boolean = false): BigNumber => {
    if (new BigNumber(amount).isZero()) {
      return new BigNumber(0)
    }
    if (symbol === 'USDT') {
      return new BigNumber(amount)
    }
    if (isLPS) {
      const pair = pairs.find(pair => pair.data.symbol === symbol)
      if (pair === undefined) {
        return new BigNumber('')
      }
      const ratioToTotal = new BigNumber(amount).div(pair.data.totalLiquidity.token)
      const tokenAAmount = ratioToTotal.times(pair.data.tokenA.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
      const tokenBAmount = ratioToTotal.times(pair.data.tokenB.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
      const usdTokenA = getTokenPrice(pair.data.tokenA.symbol, tokenAAmount)
      const usdTokenB = getTokenPrice(pair.data.tokenB.symbol, tokenBAmount)
      return usdTokenA.plus(usdTokenB)
    }
    const key = `WALLET.${network}.${blockCount ?? 0}.TOKEN_PRICE_${symbol}`
    const result = CacheApi.get(key)
    if (result !== undefined) {
      return new BigNumber(result).multipliedBy(amount)
    }
    // active price for walletTokens based on USDT
    const arbitraryPoolPair = getArbitraryPoolPair(symbol, 'USDT')

    if (arbitraryPoolPair.length > 0) {
      const {
        aToBPrice,
        estimated
      } = calculatePriceRates(symbol, arbitraryPoolPair, amount)
      // store price for each unit in cache
      CacheApi.set(key, aToBPrice.toFixed(8))
      return estimated
    }
    return new BigNumber('')
  }, [pairs, blockCount])

  const getArbitraryPoolPair = useCallback((tokenASymbol: string, tokenBSymbol: string): PoolPairData[] => {
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
  }, [pairs, blockCount])

  const calculatePriceRates = useCallback((fromTokenSymbol: string, pairs: PoolPairData[], amount: BigNumber): CalculatePriceRatesI => {
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
  }, [pairs, blockCount])

  return {
    getTokenPrice,
    calculatePriceRates,
    getArbitraryPoolPair
  }
}
