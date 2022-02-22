import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import NumberFormat from 'react-number-format'

export function TotalValueLocked (props: {tvl: number}): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-gray-50 border-gray-200')}
      dark={tailwind('bg-gray-900 border-gray-700')}
      style={tailwind('px-4 py-1 rounded border')}
    >
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs text-center')}
      >
        {translate('screens/DexScreen', 'Total Value Locked in pool pairs (USD): ')}
        <NumberFormat
          displayType='text'
          prefix='$'
          renderText={(val: string) => (
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('text-xs text-left font-medium')}
              testID='DEX_TVL'
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={new BigNumber(props.tvl).decimalPlaces(0, BigNumber.ROUND_DOWN).toString()}
        />
      </ThemedText>
    </ThemedView>
  )
}
