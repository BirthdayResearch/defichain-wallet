import { useCallback, useState } from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { ThemedText } from '@components/themed'
import { ActiveUSDValue } from '@screens/AppNavigator/screens/Loans/VaultDetail/components/ActiveUSDValue'
import { useTokenPrice } from '@screens/AppNavigator/screens/Balances/hooks/TokenPrice'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '@store'

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
  const blockCount = useSelector((state: RootState) => state.block.count)
  const decimalScale = type === 'available' ? 2 : 8
  const { getTokenPrice } = useTokenPrice()
  const [tokenAPrice, setTokenAPrice] = useState(new BigNumber(''))
  const [tokenBPrice, setTokenBPrice] = useState(new BigNumber(''))

  useFocusEffect(useCallback(() => {
    void getTokenPriceDetails()
  }, [pair, tokenATotal, tokenBTotal, blockCount]))

  const getTokenPriceDetails = async (): Promise<void> => {
    if (pair?.tokenA !== undefined) {
      const priceA = await getTokenPrice(pair.tokenA.id, new BigNumber(tokenATotal))
      setTokenAPrice(priceA)
    }
    if (pair?.tokenB !== undefined) {
      const priceB = await getTokenPrice(pair.tokenB.id, new BigNumber(tokenATotal))
      setTokenBPrice(priceB)
    }
  }

  return (
    <View
      style={tailwind('mt-1 -mb-1 flex flex-row flex-wrap')}
      testID={pair !== undefined ? `${type}_info_section_${pair.displaySymbol}` : undefined}
    >
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
              text: tokenAPrice,
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
              text: tokenBPrice,
              testID: `${testID}_${pair.symbol}_${pair.tokenB.displaySymbol}_USD`
            }}
          />
          {pair.totalLiquidity.usd !== undefined && type === 'available' && (
            <PoolPairInfoLine
              label={translate('screens/DexScreen', 'Total liquidity')}
              value={{
                text: pair.totalLiquidity.token,
                decimalScale: decimalScale,
                testID: `totalLiquidity_${pairSymbol}_token`,
                suffix: ` ${pair.displaySymbol}`
              }}
              usdValue={{
                text: new BigNumber(pair.totalLiquidity.usd),
                testID: `${testID}_totalLiquidity_${pairSymbol}_USD`
              }}
              isTitle
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
  isTitle?: boolean
}

function PoolPairInfoLine ({
  label,
  value,
  usdValue,
  isTitle
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
                  'font-medium': isTitle
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
            lightTextStyle={isTitle === true ? tailwind('text-black') : undefined}
            darkTextStyle={isTitle === true ? tailwind('text-white') : undefined}
          />
        )}
      </View>
    </View>
  )
}
