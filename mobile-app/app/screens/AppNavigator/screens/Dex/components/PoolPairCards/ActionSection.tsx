import { StyleProp, View, ViewStyle } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { IconButton } from '@components/IconButton'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'

interface ActionSectionProps {
  type: 'your' | 'available'
  onAdd: () => void
  onRemove: () => void
  onSwap: () => void
  symbol: string
  pair: PoolPairData
}

interface AvailablePairActionsProps {
  onAdd: () => void
  onSwap: () => void
  symbol: string
  isSwapDisabled: boolean
}

interface YourPairActionsProps {
  onAdd: () => void
  onRemove: () => void
  symbol: string
}

export function ActionSection ({
  onAdd,
  onRemove,
  onSwap,
  symbol,
  type,
  pair
}: ActionSectionProps): JSX.Element {
  const isSwapDisabled = !pair.tradeEnabled || !pair.status

  return (
    <View style={tailwind('flex-row flex-wrap -mb-2')}>
      {type === 'your'
        ? (
          <YourPairActions
            onAdd={onAdd}
            onRemove={onRemove}
            symbol={symbol}
          />
        )
        : (
          <AvailablePairActions
            onAdd={onAdd}
            onSwap={onSwap}
            symbol={symbol}
            isSwapDisabled={isSwapDisabled}
          />
        )}
    </View>
  )
}

export function YourPairActions ({
  onAdd,
  onRemove,
  symbol
}: YourPairActionsProps): JSX.Element {
  return (
    <>
      <ActionButton
        name='add'
        onPress={onAdd}
        pair={symbol}
        label={translate('screens/DexScreen', 'ADD')}
        style={tailwind('p-2 mr-2 mb-2')}
        testID={`pool_pair_add_${symbol}`}
      />
      <ActionButton
        name='remove'
        onPress={onRemove}
        pair={symbol}
        label={translate('screens/DexScreen', 'REMOVE')}
        style={tailwind('p-2 mr-2 mb-2')}
        testID={`pool_pair_remove_${symbol}`}
      />
    </>
  )
}

function AvailablePairActions ({
  onAdd,
  onSwap,
  symbol,
  isSwapDisabled
}: AvailablePairActionsProps): JSX.Element {
  return (
    <>
      <ActionButton
        name='add'
        onPress={onAdd}
        pair={symbol}
        label={translate('screens/DexScreen', 'ADD')}
        style={tailwind('p-2 mr-2 mb-2')}
        testID={`pool_pair_add_${symbol}`}
      />
      <ActionButton
        name='swap-horiz'
        onPress={onSwap}
        pair={symbol}
        label={translate('screens/DexScreen', 'SWAP')}
        disabled={isSwapDisabled}
        style={tailwind('p-2 mr-2 mb-2')}
        testID={`pool_pair_swap-horiz_${symbol}`}
      />
    </>
  )
}

interface ActionButtonProps {
  name: React.ComponentProps<typeof MaterialIcons>['name']
  pair: string
  onPress: () => void
  label: string
  style?: StyleProp<ViewStyle>
  disabled?: boolean
  testID: string
}

export function ActionButton (props: ActionButtonProps): JSX.Element {
  return (
    <IconButton
      iconName={props.name}
      iconSize={16}
      iconType='MaterialIcons'
      onPress={props.onPress}
      style={props.style}
      testID={props.testID}
      iconLabel={props.label}
      disabled={props.disabled}
    />
  )
}
