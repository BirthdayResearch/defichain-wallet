import BigNumber from 'bignumber.js'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { getNativeIcon } from '@components/icons/assets'
import { ThemedText } from '@components/themed'
import { translate } from '@translations'

interface PriceRatesSectionProps {
  tokenA: {
    symbol: string
    displaySymbol: string
    aToBPrice: BigNumber
  }
  tokenB: {
    symbol: string
    displaySymbol: string
    bToAPrice: BigNumber
  }
}

export function PriceRatesSection ({
  tokenA,
  tokenB
}: PriceRatesSectionProps): JSX.Element {
  const TokenAIcon = getNativeIcon(tokenA.displaySymbol)
  const TokenBIcon = getNativeIcon(tokenB.displaySymbol)
  if (
    new BigNumber(tokenA.aToBPrice).isNaN() ||
    new BigNumber(tokenB.bToAPrice).isNaN()
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
        {translate('screens/PriceRatesSection', 'Prices')}
      </ThemedText>
      <View style={tailwind('flex flex-row items-center m-0.5')}>
        <TokenAIcon height={16} width={16} />
        <ThemedText style={tailwind('text-xs ml-1')}>
          {translate(
            'screens/PriceRatesSection',
            '1 {{tokenASymbol}} = {{aToBPrice}} {{tokenBSymbol}}',
            {
              tokenASymbol: tokenA.displaySymbol,
              tokenBSymbol: tokenB.displaySymbol,
              aToBPrice: tokenA.aToBPrice.toFixed(8)
            }
          )}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row items-center m-0.5')}>
        <TokenBIcon height={16} width={16} />
        <ThemedText style={tailwind('text-xs ml-1')}>
          {translate(
            'screens/PriceRatesSection',
            '1 {{tokenBSymbol}} = {{bToAPrice}} {{tokenASymbol}}',
            {
              tokenASymbol: tokenA.displaySymbol,
              tokenBSymbol: tokenB.displaySymbol,
              bToAPrice: tokenB.bToAPrice.toFixed(8)
            }
          )}
        </ThemedText>
      </View>
    </View>
  )
}
