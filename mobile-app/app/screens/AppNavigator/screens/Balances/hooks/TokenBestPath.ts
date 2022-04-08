import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { RootState } from '@store'
import { PoolPairData, BestSwapPathResult } from '@defichain/whale-api-client/dist/api/poolpairs'
import { useSelector } from 'react-redux'
import { CacheApi } from '@api/cache'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'

interface CalculatePriceRatesProps {
  aToBPrice: BigNumber
  bToAPrice: BigNumber
  estimated: BigNumber
}

interface TokenBestPath {
  calculatePriceRates: (fromTokenId: string, toTokenId: string, amount: BigNumber) => Promise<CalculatePriceRatesProps>
  getArbitraryPoolPair: (tokenAId: string, tokenBId: string) => Promise<PoolPairData[]>
}

export function useTokenBestPath (): TokenBestPath {
  const client = useWhaleApiClient()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const { network } = useNetworkContext()

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

  const calculatePriceRates = useCallback(async (fromTokenId: string, toTokenId: string, amount: BigNumber): Promise<CalculatePriceRatesProps> => {
    const bestPathData = await getBestPath(getTokenId(fromTokenId), getTokenId(toTokenId))

    let lastTokenById = fromTokenId
    let lastAmount = new BigNumber(amount)
    if (bestPathData?.bestPath.length > 0) {
      const priceRates = bestPathData.bestPath.reduce((priceRates, pair): { aToBPrice: BigNumber, bToAPrice: BigNumber, estimated: BigNumber } => {
        const tokenBId = pair.tokenB.id === lastTokenById ? pair.tokenA.id : pair.tokenB.id
        // To sequentially convert the token from its last token
        const aToBPrice = pair.tokenB.id === lastTokenById ? pair.priceRatio.ab : pair.priceRatio.ba
        const bToAPrice = pair.tokenB.id === lastTokenById ? pair.priceRatio.ba : pair.priceRatio.ab

        const estimated = new BigNumber(lastAmount).times(aToBPrice)

        lastAmount = estimated
        lastTokenById = tokenBId
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
      aToBPrice: new BigNumber(''),
      bToAPrice: new BigNumber(''),
      estimated: new BigNumber('')
    }
  }, [pairs, blockCount])

  return {
    calculatePriceRates,
    getArbitraryPoolPair
  }
}
