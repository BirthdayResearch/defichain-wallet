import { memo } from 'react'
import BigNumber from 'bignumber.js'
import { View } from 'react-native'
import { isEqual } from 'lodash'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedText } from '@components/themed'
import { translate } from '@translations'

interface PriceRatesSectionProps {
  tokenA: {
    symbol: string
    displaySymbol: string
    priceRate: BigNumber
  }
  tokenB: {
    symbol: string
    displaySymbol: string
    priceRate: BigNumber
  }
}

export const PriceRatesSection = memo(({
  tokenA,
  tokenB
}: PriceRatesSectionProps): JSX.Element => {
  const TokenAIcon = getNativeIcon(tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(tokenB.displaySymbol)
  if (
    new BigNumber(tokenA.priceRate).isNaN() ||
    new BigNumber(tokenB.priceRate).isNaN()
  ) {
    return <></>
  }

  return (
    <View style={tailwind('flex')}>
      <ThemedText
        style={tailwind('text-xs m-1 mt-2')}
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
      >
        {translate('screens/DexScreen', 'Prices')}
      </ThemedText>
      <View style={tailwind('flex flex-row items-center m-0.5')}>
        <TokenAIcon height={16} width={16} />
        <ThemedText
          testID={`price_rate_${tokenA.displaySymbol}-${tokenB.displaySymbol}`}
          style={tailwind('text-sm ml-1')}
        >
          {`1 ${tokenA.displaySymbol} = ${tokenA.priceRate.toFixed(8)} ${tokenB.displaySymbol}`}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row items-center m-0.5')}>
        <TokenBIcon height={16} width={16} />
        <ThemedText
          testID={`price_rate_${tokenB.displaySymbol}-${tokenA.displaySymbol}`}
          style={tailwind('text-sm ml-1')}
        >
          {`1 ${tokenB.displaySymbol} = ${tokenB.priceRate.toFixed(8)} ${tokenA.displaySymbol}`}
        </ThemedText>
      </View>
    </View>
  )
}, isEqual)
