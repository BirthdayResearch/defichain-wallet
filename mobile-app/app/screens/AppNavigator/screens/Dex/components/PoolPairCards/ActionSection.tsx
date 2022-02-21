import { useCallback } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { NavigationProp, useNavigation } from '@react-navigation/core'
import { MaterialIcons } from '@expo/vector-icons'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { IconButton } from '@components/IconButton'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { DexParamList } from '../../DexNavigator'

interface ActionSectionProps {
  type: 'your' | 'available'
  onAdd: (data: PoolPairData) => void
  onRemove: () => void
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
  symbol,
  type,
  pair
}: ActionSectionProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const isSwapDisabled = !pair.tradeEnabled || !pair.status

  const onAddLiquidity = useCallback(() => {
    onAdd(pair)
  }, [])

  const onSwap = useCallback(() => {
    navigation.navigate({
      name: 'CompositeSwap',
      params: { pair },
      merge: true
    })
  }, [])

  return (
    <View style={tailwind('flex-row flex-wrap -mr-2')}>
      {type === 'your'
? (
  <YourPairActions
    onAdd={onAddLiquidity}
    onRemove={onRemove}
    symbol={symbol}
  />
      )
: (
  <AvailablePairActions
    onAdd={onAddLiquidity}
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
        style={tailwind('p-2 mr-2 mt-2')}
        testID={`pool_pair_add_${symbol}`}
      />
      <ActionButton
        name='remove'
        onPress={onRemove}
        pair={symbol}
        label={translate('screens/DexScreen', 'REMOVE')}
        style={tailwind('p-2 mr-2 mt-2')}
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
        style={tailwind('p-2 mr-2 mt-2')}
        testID={`pool_pair_add_${symbol}`}
      />
      <ActionButton
        name='swap-horiz'
        onPress={onSwap}
        pair={symbol}
        label={translate('screens/DexScreen', 'SWAP')}
        disabled={isSwapDisabled}
        style={tailwind('p-2 mr-2 mt-2')}
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
