import { ThemedText, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { ScrollView, ViewStyle, StyleProp } from 'react-native'
import { PropsWithChildren } from 'react'
import { tailwind } from '@tailwind'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { PoolPairTextSectionV2 } from '@screens/AppNavigator/screens/Dex/components/PoolPairCards/PoolPairTextSectionV2'
import { View } from '@components'
import { DexActionButton } from '@screens/AppNavigator/screens/Dex/components/DexActionButton'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'
import { useUnitSuffix } from '@hooks/useUnitSuffix'

interface DexScrollableProps {
  containerStyle?: StyleProp<ViewStyle>
  sectionStyle?: StyleProp<ViewStyle>
  testId: string
  sectionHeading: string
}

export function DexScrollable (props: PropsWithChildren<DexScrollableProps>): JSX.Element {
  const {
    containerStyle,
    children,
    testId,
    sectionHeading,
    sectionStyle
  } = props
  return (
    <ThemedViewV2 testID={testId} style={[tailwind('flex flex-col'), sectionStyle]}>
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-500')}
        light={tailwind('text-mono-light-v2-500')}
        style={tailwind('font-normal-v2 text-xs uppercase pl-10 mb-2')}
      >
        {sectionHeading}
      </ThemedTextV2>
      <ScrollView
        contentContainerStyle={[tailwind('pl-5'), containerStyle]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </ThemedViewV2>
  )
}

interface DexScrollableCardProps {
  poolpair: PoolPairData
  style?: StyleProp<ViewStyle>
  label: string
  onPress: (data: PoolPairData) => void
}

function DexScrollableCard ({
  poolpair,
  style,
  onPress,
  label
}: DexScrollableCardProps): JSX.Element {
  const [symbolA, symbolB] = [poolpair.tokenA.displaySymbol, poolpair.tokenB.displaySymbol]
  return (
    <ThemedViewV2
      style={[tailwind('px-5 py-4 rounded-lg-v2'), style]}
      dark={tailwind('bg-mono-dark-v2-00')}
      light={tailwind('bg-mono-light-v2-00')}
    >
      <View style={tailwind('flex flex-row items-center')}>
        <PoolPairTextSectionV2
          symbolA={symbolA}
          symbolB={symbolB}
          iconSize={36}
          iconBStyle={tailwind('-ml-4 mr-2')}
        />
        <View style={tailwind('flex flex-col')}>
          <ThemedTextV2
            ellipsizeMode='tail'
            numberOfLines={1}
            style={tailwind('text-xs font-normal-v2 w-20')}
            dark={tailwind('text-mono-dark-v2-700')}
            light={tailwind('text-mono-light-v2-700')}
            testID={`${symbolA}-${symbolB}`}
          >
            {`${symbolA}-${symbolB}`}
          </ThemedTextV2>
          {poolpair.totalLiquidity.usd !== undefined && (
            <TotalLiquidityValue
              value={poolpair.totalLiquidity.usd}
              testId={`${poolpair.tokenA.symbol}-${poolpair.tokenB.symbol}`}
            />
          )}
        </View>
      </View>
      <View style={tailwind('flex flex-row items-end justify-between mt-4')}>
        <DexActionButton
          pair={poolpair}
          onPress={onPress}
          label={label}
          style={tailwind('flex w-full w-36')}
        />
      </View>
    </ThemedViewV2>
  )
}

function TotalLiquidityValue ({
  value,
  testId
}: { value: string, testId: string }): JSX.Element {
  const isSixDigits = new BigNumber(value ?? 0).gte(new BigNumber(1000000))
  const valueToUnitSuffix = useUnitSuffix({ 6: 'M' }, value)

  return (
    <>
      {isSixDigits
? (
  <ThemedTextV2
    style={tailwind('font-semibold-v2 text-sm')}
    dark={tailwind('text-mono-dark-v2-900')}
    light={tailwind('text-mono-light-v2-900')}
    testID={`${testId}-total_liquidity`}
  >
    {`$${valueToUnitSuffix}`}
  </ThemedTextV2>
        )
: (
  <NumberFormat
    value={value}
    decimalScale={0}
    thousandSeparator
    displayType='text'
    renderText={(val: string) => (
      <ThemedText
        style={tailwind('font-semibold-v2 text-sm')}
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        testID={`${testId}-total_liquidity`}
      >
        {val}
      </ThemedText>
              )}
  />
        )}
    </>
  )
}

DexScrollable.Card = DexScrollableCard
