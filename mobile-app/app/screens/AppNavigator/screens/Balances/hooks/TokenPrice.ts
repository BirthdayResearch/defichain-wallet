import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { PoolPairData, BestSwapPathResult } from '@defichain/whale-api-client/dist/api/poolpairs'
import { useSelector } from 'react-redux'
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
  getArbitraryPoolPair: (tokenASymbol: string, tokenBSymbol: string) => Promise<PoolPairData[]>
}

export function useTokenPrice (): TokenPrice {
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  // TODO add logic here for setting to token id
  const toTokenId = useSelector((state: RootState) => tokenSelectorByDisplaySymbol(state.wallet, 'dUSDT'))?.id

  const getTokenId = (id: string): string => {
    return id === '0_unified' || id === '0_utxo' ? '0' : id
  }

  const getTokenPrice = useCallback(async (fromTokenId: string, amount: BigNumber): Promise<BigNumber> => {
    if (toTokenId !== undefined) {
      if (fromTokenId === toTokenId || new BigNumber(amount).isZero()) {
        return new BigNumber(amount)
      }
      const { estimatedReturn } = await getBestPath(getTokenId(fromTokenId), getTokenId(toTokenId))
      return new BigNumber(estimatedReturn).multipliedBy(amount)
    }
    return new BigNumber('')
  }, [blockCount])

  const getArbitraryPoolPair = useCallback(async (tokenAId: string, tokenBId: string): Promise<PoolPairData[]> => {
    const { bestPath } = await getBestPath(getTokenId(tokenAId), getTokenId(tokenBId))
    return bestPath.reduce((poolPairs: PoolPairData[], path, index) => {
      const pair = pairs.find((eachPair) => eachPair.data.id === path.poolPairId)
      if (pair === undefined) {
        return poolPairs
      }
      return [...poolPairs, pair.data]
    }, [])
  }, [pairs, blockCount])

  const getBestPath = async (fromTokenId: string, toTokenId: string): Promise<BestSwapPathResult> => {
    const key = `WALLET.${network}.${blockCount ?? 0}.BEST_PATH_${fromTokenId}_${toTokenId}`
    const result = CacheApi.get(key)
    if (result !== undefined) {
      return result
    }
    const bestPathData = await client.poolpairs.getBestPath(fromTokenId, toTokenId)
    CacheApi.set(key, bestPathData)
    return bestPathData
  }

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
