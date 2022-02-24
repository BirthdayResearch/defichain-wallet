import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { ThemedText } from '@components/themed'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'
import { useTokenPrice } from '@screens/AppNavigator/screens/Balances/hooks/TokenPrice'

interface InfoSectionProps {
  type: 'available' | 'your'
  pair: PoolPairData | undefined
  tokenATotal: string
  tokenBTotal: string
  testID: string
}

export function InfoSection ({
  type,
  pair,
  tokenATotal,
  tokenBTotal,
  testID
}: InfoSectionProps): JSX.Element {
  const pairSymbol =
    pair?.tokenA.displaySymbol !== undefined &&
      pair?.tokenB.displaySymbol !== undefined
      ? `${pair?.tokenA?.displaySymbol}-${pair?.tokenB?.displaySymbol}`
      : ''
  const decimalScale = type === 'available' ? 2 : 8
  const { getTokenPrice } = useTokenPrice()

  const getUSDValue = (
    amount: BigNumber,
    symbol: string,
    isLPs: boolean = false
  ): BigNumber => {
    return getTokenPrice(symbol, amount, isLPs)
  }

  return (
    <View style={tailwind('mt-1 -mb-1 flex flex-row flex-wrap')}>
      {pair !== undefined && (
        <>
          <PoolPairInfoLine
            label={translate(
              'screens/DexScreen',
              `${type === 'available' ? 'Pooled' : 'Your shared'} {{symbol}}`,
              { symbol: pair.tokenA.displaySymbol }
            )}
            value={{
              text: tokenATotal,
              decimalScale: decimalScale,
              testID: `${testID}_${pair.symbol}_${pair.tokenA.displaySymbol}`,
              suffix: ` ${pair.tokenA.displaySymbol}`
            }}
            usdValue={{
              text: getUSDValue(
                new BigNumber(tokenATotal),
                pair.tokenA.symbol
              ),
              testID: `${testID}_${pair.symbol}_${pair.tokenA.displaySymbol}_USD`
            }}
          />
          <PoolPairInfoLine
            label={translate(
              'screens/DexScreen',
              `${type === 'available' ? 'Pooled' : 'Your shared'} {{symbol}}`,
              { symbol: pair.tokenB.displaySymbol }
            )}
            value={{
              text: tokenBTotal,
              decimalScale: decimalScale,
              testID: `${testID}_${pair.symbol}_${pair.tokenB.displaySymbol}`,
              suffix: ` ${pair.tokenB.displaySymbol}`
            }}
            usdValue={{
              text: getUSDValue(
                new BigNumber(tokenBTotal),
                pair.tokenB.symbol
              ),
              testID: `${testID}_${pair.symbol}_${pair.tokenB.displaySymbol}_USD`
            }}
          />
          {pair.totalLiquidity.usd !== undefined && type === 'available' && (
            <PoolPairInfoLine
              label={translate('screens/DexScreen', 'Total liquidity (USD)')}
              value={{
                text: pair.totalLiquidity.usd,
                decimalScale: 2,
                testID: `totalLiquidity_${pairSymbol}`,
                prefix: '$'
              }}
            />
          )}
        </>
      )}
    </View>
  )
}

interface PoolPairInfoLineProps {
  label: string
  value: {
    decimalScale: number
    suffix?: string
    prefix?: string
    testID: string
    text: string
  }
  usdValue?: {
    text: BigNumber
    testID: string
  }
}

function PoolPairInfoLine ({
  label,
  value,
  usdValue
}: PoolPairInfoLineProps): JSX.Element {
  return (
    <View
      style={tailwind([
        'flex-row justify-between mt-3 w-full',
        {
          'items-center': usdValue === undefined
        }
      ])}
    >
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs font-normal')}
      >
        {label}
      </ThemedText>
      <View style={tailwind('items-end')}>
        <NumberFormat
          decimalScale={value.decimalScale}
          displayType='text'
          renderText={(textValue) => (
            <ThemedText
              style={tailwind([
                {
                  'text-base font-semibold': usdValue === undefined
                },
                {
                  'text-sm leading-4 mb-1': usdValue !== undefined
                }
              ])}
              testID={value.testID}
            >
              {textValue}
            </ThemedText>
          )}
          thousandSeparator
          suffix={value.suffix}
          prefix={value.prefix}
          value={value.text}
        />
        {usdValue !== undefined && (
          <ActiveUSDValue
            price={usdValue.text}
            containerStyle={tailwind('justify-end -mt-0.5')}
            testId={usdValue.testID}
          />
        )}
      </View>
    </View>
  )
}
