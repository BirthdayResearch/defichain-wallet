import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { useSelector } from 'react-redux'
import { checkIfPair, findPath, GraphProps } from '@screens/AppNavigator/screens/Dex/helpers/path-finding'
import { CacheApi } from '@api/cache'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { tokenSelectorByDisplaySymbol } from '@store/wallet'

interface CalculatePriceRatesI {
  aToBPrice: BigNumber
  bToAPrice: BigNumber
  estimated: BigNumber
}

interface TokenPrice {
  getTokenPrice: (symbol: string, amount: BigNumber, isLPS?: boolean) => Promise<BigNumber>
  calculatePriceRates: (fromTokenSymbol: string, pairs: PoolPairData[], amount: BigNumber) => CalculatePriceRatesI
  getArbitraryPoolPair: (tokenASymbol: string, tokenBSymbol: string) => PoolPairData[]
}

export function useTokenPrice (): TokenPrice {
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  // TODO add logic here for setting to token id
  const toTokenId = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, 'dUSDT'))?.id
  const graph: GraphProps[] = useMemo(() => pairs.map(pair => {
    return {
      pairId: pair.data.id,
      a: pair.data.tokenA.symbol,
      b: pair.data.tokenB.symbol
    }
  }), [pairs])

  const getTokenPrice = useCallback(async (fromTokenId: string, amount: BigNumber): Promise<BigNumber> => {
    if (toTokenId !== undefined) {
      const from = fromTokenId === '0_unified' || fromTokenId === '0_utxo' ? '0' : fromTokenId
      if (from === toTokenId || new BigNumber(amount).isZero()) {
        return new BigNumber(amount)
      }
      const key = `WALLET.${network}.${blockCount ?? 0}.TOKEN_PRICE_${from}`
      const result = CacheApi.get(key)
      if (result !== undefined) {
        return new BigNumber(result).multipliedBy(amount)
      }
      const { estimatedReturn } = await client.poolpairs.getBestPath(from, toTokenId)
      CacheApi.set(key, estimatedReturn)
      return new BigNumber(estimatedReturn).multipliedBy(amount)
    }
    return new BigNumber('')
  }, [blockCount])

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
    calculatePriceRates,
    getArbitraryPoolPair,
    getTokenPrice
  }
}
