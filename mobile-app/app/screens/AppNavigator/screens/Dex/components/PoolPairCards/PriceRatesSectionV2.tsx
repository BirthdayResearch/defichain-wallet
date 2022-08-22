import { memo } from 'react'
import BigNumber from 'bignumber.js'
import { View } from 'react-native'
import { isEqual } from 'lodash'
import { tailwind } from '@tailwind'
import { ThemedTextV2 } from '@components/themed'
import NumberFormat from 'react-number-format'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'

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

export const PriceRatesSectionV2 = memo(({
  tokenA,
  tokenB
}: PriceRatesSectionProps): JSX.Element => {
  if (
    new BigNumber(tokenA.priceRate).isNaN() ||
    new BigNumber(tokenB.priceRate).isNaN()
  ) {
    return (
      <View style={tailwind('mt-2')}>
        <SkeletonLoader row={1} screen={SkeletonLoaderScreen.DexPrices} />
      </View>
    )
  }
  return (
    <View style={tailwind('flex flex-col')}>
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedTextV2
          style={tailwind('text-sm font-normal-v2')}
          dark={tailwind('text-mono-dark-v2-700')}
          light={tailwind('text-mono-light-v2-700')}
        >
          {`1 ${tokenA.displaySymbol} =`}
        </ThemedTextV2>
        <PriceRateValue
          value={tokenA.priceRate.toFixed(8)}
          suffix={tokenB.displaySymbol}
          testID={`price_rate_${tokenA.displaySymbol}-${tokenB.displaySymbol}`}
        />
      </View>
      <View style={tailwind('flex flex-row items-center')}>
        <ThemedTextV2
          style={tailwind('text-sm font-normal-v2')}
          dark={tailwind('text-mono-dark-v2-700')}
          light={tailwind('text-mono-light-v2-700')}
        >
          {`1 ${tokenB.displaySymbol} =`}
        </ThemedTextV2>
        <PriceRateValue
          value={tokenB.priceRate.toFixed(8)}
          suffix={tokenA.displaySymbol}
          testID={`price_rate_${tokenB.displaySymbol}-${tokenA.displaySymbol}`}
        />
      </View>
    </View>
  )
}, isEqual)

const PriceRateValue = (props: { value: string, suffix: string, testID: string }): JSX.Element => {
  return (
    <View style={tailwind('flex flex-row')}>
      <NumberFormat
        displayType='text'
        renderText={(textValue) => (
          <ThemedTextV2
            style={[tailwind('text-sm ml-1 font-normal-v2'), { maxWidth: 80 }]}
            testID={props.testID}
            ellipsizeMode='tail'
            numberOfLines={1}
          >
            {textValue}
          </ThemedTextV2>
        )}
        thousandSeparator
        value={props.value}
      />
      <ThemedTextV2
        style={tailwind('text-sm font-normal-v2 ml-0.5')}
      >
        {props.suffix}
      </ThemedTextV2>
    </View>
  )
}
