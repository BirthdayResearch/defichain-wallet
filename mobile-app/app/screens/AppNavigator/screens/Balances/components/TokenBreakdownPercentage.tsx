import { View } from '@components'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useTokenBreakdownPercentage } from '../hooks/TokenLockedBalance'

interface TokenBreakdownPercentageProps {
  lockedAmount: BigNumber
  availableAmount: BigNumber
  symbol: string
  onBreakdownPress: () => void
  isBreakdownExpanded: boolean
}

export function TokenBreakdownPercentage (props: TokenBreakdownPercentageProps): JSX.Element {
  const {
    availablePercentage,
    lockedPercentage
  } = useTokenBreakdownPercentage({ available: props.availableAmount, locked: props.lockedAmount })

  return (
    <View style={tailwind('flex flex-row items-center bg-transparent justify-between mb-1')}>
      <View style={tailwind('flex flex-row items-center')}>
        <BreakdownPercentageItem
          type='available'
          isDfi={props.symbol === 'DFI'}
          percentage={availablePercentage}
        />
        <BreakdownPercentageItem
          type='locked'
          percentage={lockedPercentage}
        />
      </View>
      <TouchableOpacity
        onPress={props.onBreakdownPress}
        style={tailwind('flex flex-row pb-2 pt-1.5')}
        testID={`details_${props.symbol}`}
      >
        <ThemedIcon
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
          iconType='MaterialIcons'
          name={!props.isBreakdownExpanded ? 'expand-more' : 'expand-less'}
          size={28}
        />
      </TouchableOpacity>
    </View>
  )
}

type BreakdownType = 'available' | 'locked'
interface BreakdownPercentageItemProps {
  type: BreakdownType
  isDfi?: boolean
  percentage: BigNumber
}

function BreakdownPercentageItem (props: BreakdownPercentageItemProps): JSX.Element {
  return (
    <ThemedView
      style={tailwind('flex flex-row items-center p-1 rounded-xl mr-1')}
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
    >
      {props.type === 'available'
        ? (props.isDfi === true && (
          <SymbolIcon symbol='DFI' styleProps={tailwind('w-4 h-4')} />
        ))
        : (
          <ThemedIcon
            light={tailwind('text-gray-600')}
            dark={tailwind('text-gray-500')}
            iconType='MaterialIcons'
            name='lock'
            size={16}
          />
        )}
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('text-xs', { 'ml-1': props.type === 'available' && props.isDfi === true })}
      >
        {translate('screens/BalancesScreen', `${props.type === 'available' ? 'Available: ' : 'Locked: '}`)}
      </ThemedText>
      <NumberFormat
        value={props.percentage.toFixed(2)}
        thousandSeparator
        decimalScale={2}
        displayType='text'
        suffix='%'
        renderText={value =>
          <ThemedText
            style={tailwind('text-xs')}
            testID={`${props.type}_percentage`}
          >
            {value}
          </ThemedText>}
      />
    </ThemedView>
  )
}
