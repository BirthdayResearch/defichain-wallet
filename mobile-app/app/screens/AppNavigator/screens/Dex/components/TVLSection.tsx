import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import BigNumber from 'bignumber.js'
import { NavigationProp, useNavigation } from '@react-navigation/core'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedText, ThemedView } from '@components/themed'
import { DexParamList } from '../DexNavigator'
import { ActionButton } from './PoolPairCards/ActionSection'

interface TVLSectionProps {
  tvl: number
}

export function TVLSection (props: TVLSectionProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex flex-row px-4 py-3 justify-between text-center')}
    >
      <View style={tailwind('flex flex-col')}>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('screens/DexScreen', 'Total Value Locked (USD)')}
        </ThemedText>
        <ThemedText>
          <NumberFormat
            displayType='text'
            prefix='$'
            renderText={(val: string) => (
              <ThemedText
                dark={tailwind('text-gray-50')}
                light={tailwind('text-gray-900')}
                style={tailwind('text-lg text-left font-bold')}
                testID='DEX_TVL'
              >
                {val}
              </ThemedText>
            )}
            thousandSeparator
            value={new BigNumber(props.tvl)
              .decimalPlaces(0, BigNumber.ROUND_DOWN)
              .toString()}
          />
        </ThemedText>
      </View>
      <ActionButton
        name='swap-horiz'
        onPress={() =>
          navigation.navigate({
            name: 'CompositeSwap',
            params: {},
            merge: true
          })}
        pair='composite'
        label={translate('screens/DexScreen', 'SWAP')}
        style={tailwind('my-2 p-2')}
        testID='composite_swap'
      />
    </ThemedView>
  )
}
