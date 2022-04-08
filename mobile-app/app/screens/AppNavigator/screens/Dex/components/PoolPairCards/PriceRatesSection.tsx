import { memo } from 'react'
import BigNumber from 'bignumber.js'
import { View } from 'react-native'
import { isEqual } from 'lodash'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedText } from '@components/themed'
import { translate } from '@translations'
import NumberFormat from 'react-number-format'
import { TextSkeletonLoader } from '@components/TextSkeletonLoader'

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
  return (
    <View style={tailwind('flex flex-col justify-center items-start')}>
      <View style={tailwind('mt-2')}>
        <TextSkeletonLoader
          iContentLoaderProps={{
          width: '60',
          height: '14',
          testID: 'available_percentage_skeleton_loader'
        }}
          textWidth='60'
        />
      </View>
      <View style={tailwind('mt-2')}>
        <TextSkeletonLoader
          iContentLoaderProps={{
          width: '200',
          height: '16',
          testID: 'available_percentage_skeleton_loader'
        }}
          textWidth='180'
        />
      </View>
      <View style={tailwind('mt-1')}>
        <TextSkeletonLoader
          iContentLoaderProps={{
          width: '180',
          height: '16',
          testID: 'available_percentage_skeleton_loader'
        }}
          textWidth='180'
        />
      </View>
    </View>
  )
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
        <View style={tailwind('flex flex-row items-center')}>
          <ThemedText style={tailwind('text-sm ml-1')}>
            {`1 ${tokenA.displaySymbol} =`}
          </ThemedText>
          <PriceRateValue
            value={tokenA.priceRate.toFixed(8)}
            suffix={tokenB.displaySymbol}
            testID={`price_rate_${tokenA.displaySymbol}-${tokenB.displaySymbol}`}
          />
        </View>
      </View>
      <View style={tailwind('flex flex-row items-center m-0.5')}>
        <TokenBIcon height={16} width={16} />
        <ThemedText style={tailwind('text-sm ml-1')}>
          {`1 ${tokenB.displaySymbol} =`}
        </ThemedText>
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
    <NumberFormat
      decimalScale={8}
      displayType='text'
      renderText={(textValue) => (
        <ThemedText style={tailwind('text-sm ml-1')} testID={props.testID}>
          {textValue}
        </ThemedText>
      )}
      thousandSeparator
      value={props.value}
      suffix={` ${props.suffix}`}
    />
  )
}
