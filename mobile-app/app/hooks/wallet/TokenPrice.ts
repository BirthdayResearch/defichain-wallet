import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { checkIfPair, findPath, GraphProps } from '@screens/AppNavigator/screens/Dex/helpers/path-finding'
import { RootState } from '@store'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

interface TokenPriceProps {
  symbol: string
  amount: BigNumber
  isLPS?: boolean
}

interface PriceRates {
  aToBPrice: BigNumber
  bToAPrice: BigNumber
  estimated: BigNumber
}

interface ArbitraryPoolPairProps {
  tokenASymbol: string
  tokenBSymbol: string
}

interface PriceRatesProps {
  fromTokenSymbol: string
  pairs: PoolPairData[]
  amount: BigNumber
}

export function useTokenPrice (props: TokenPriceProps): BigNumber {
  const {
    symbol,
    amount,
    isLPS = false
  } = props
  const [tokenPrice, setTokenPrice] = useState<BigNumber>(new BigNumber(NaN))
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)

  const getArbitraryPoolPair = useCallback((props: ArbitraryPoolPairProps): PoolPairData[] => {
    // uncomment to compare performance
    // return []
    const graph: GraphProps[] = pairs.map(pair => {
      return {
        pairId: pair.data.id,
        a: pair.data.tokenA.symbol,
        b: pair.data.tokenB.symbol
      }
    })

    // TODO - Handle cheapest path with N hops, currently this logic finds the shortest path
    const { path } = findPath(graph, props.tokenASymbol, props.tokenBSymbol)
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
  }, [pairs])

  const getPriceRates = useCallback((props: PriceRatesProps): PriceRates => {
    // uncomment to compare performance
    // return {
    //   aToBPrice: new BigNumber(1),
    //   bToAPrice: new BigNumber(1),
    //   estimated: new BigNumber(0)
    // }
    let lastTokenBySymbol = props.fromTokenSymbol
    let lastAmount = props.amount
    const priceRates = props.pairs.reduce((priceRates, pair): { aToBPrice: BigNumber, bToAPrice: BigNumber, estimated: BigNumber } => {
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
  }, [])

  useEffect(() => {
    if (amount.isZero()) {
      setTokenPrice(new BigNumber(0))
    } else if (symbol === 'USDT') {
      setTokenPrice(amount)
    } else if (isLPS) {
      const pair = pairs.find(pair => pair.data.symbol === symbol)
      if (pair !== undefined) {
        // const ratioToTotal = amount.div(pair.data.totalLiquidity.token)
        // const tokenAAmount = ratioToTotal.times(pair.data.tokenA.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
        // const tokenBAmount = ratioToTotal.times(pair.data.tokenB.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
        // const usdTokenA = useTokenPrice({ symbol: pair.data.tokenA.symbol, amount: tokenAAmount }) // violates rules of hook
        const usdTokenA = new BigNumber(1) // comment to compare performance
        // const usdTokenB = useTokenPrice({ symbol: pair.data.tokenB.symbol, amount: tokenBAmount }) // violates rules of hook
        const usdTokenB = new BigNumber(1) // comment to compare performance
        setTokenPrice(usdTokenA.plus(usdTokenB))
      }
    } else {
      // active price for walletTokens based on USDT
      const arbitraryPoolPair = getArbitraryPoolPair({ tokenASymbol: symbol, tokenBSymbol: 'USDT' })

      if (arbitraryPoolPair.length > 0) {
        const { estimated } = getPriceRates({ fromTokenSymbol: symbol, pairs: arbitraryPoolPair, amount: amount })
        setTokenPrice(estimated)
      }
    }
  }, [symbol, amount, isLPS, pairs])

  return tokenPrice
}
