import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { PoolPairData, BestSwapPathResult } from '@defichain/whale-api-client/dist/api/poolpairs'
import { useSelector } from 'react-redux'
import { CacheApi } from '@api/cache'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'

interface CalculatePriceRatesI {
  aToBPrice: BigNumber
  bToAPrice: BigNumber
  estimated: BigNumber
}

interface TokenPrice {
  getTokenPrice: (symbol: string, amount: BigNumber, isLPS?: boolean) => BigNumber
  calculatePriceRates: (fromTokenSymbol: string, pairs: PoolPairData[], amount: BigNumber) => CalculatePriceRatesI
  getArbitraryPoolPair: (tokenASymbol: string, tokenBSymbol: string) => Promise<PoolPairData[]>
}

export function useTokenPrice (): TokenPrice {
  const client = useWhaleApiClient()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const dexPrices = useSelector((state: RootState) => state.wallet.dexPrices)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const denominationTokenSymbol = 'USDT'
  const { network } = useNetworkContext()

  /**
   * @param symbol {string} token symbol
   * @param amount {string} token amount
   * @param isLPS {boolean} is liquidity pool token
   * @return BigNumber
   */
  const getTokenPrice = useCallback((symbol: string, amount: BigNumber, isLPS: boolean = false): BigNumber => {
    if (new BigNumber(amount).isZero()) {
      return new BigNumber(0)
    }
    if (symbol === denominationTokenSymbol) {
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
    const prices = dexPrices[denominationTokenSymbol]
    return new BigNumber(prices[symbol]?.denominationPrice).multipliedBy(amount)
  }, [pairs, blockCount])

  const getTokenId = (id: string): string => {
    return id === '0_unified' || id === '0_utxo' ? '0' : id
  }

  const getArbitraryPoolPair = useCallback(async (tokenAId: string, tokenBId: string): Promise<PoolPairData[]> => {
    const { bestPath } = await getBestPath(getTokenId(tokenAId), getTokenId(tokenBId))
    return bestPath.reduce((poolPairs: PoolPairData[], path: { poolPairId: string }) => {
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
    getTokenPrice,
    calculatePriceRates,
    getArbitraryPoolPair
  }
}
