import { View } from '@components'
import { IconName, IconType, ThemedIcon, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ScrollView, Text } from 'react-native'
import { useSelector } from 'react-redux'
import { PortfolioParamList } from '../PortfolioNavigator'

export interface ActionButtonsProps {
  name: string
  icon: IconName
  iconType: IconType
  onPress: () => void
  badge?: string | number
}

export function ActionButtons (): JSX.Element {
  const { isFeatureAvailable } = useFeatureFlagContext()
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>()
  const { futureSwaps } = useSelector((state: RootState) => state.futureSwaps)

  const actions: ActionButtonsProps[] = [
    {
      name: translate('components/ActionButtons', 'Send'),
      icon: 'arrow-up-right',
      iconType: 'Feather',
      onPress: () => navigation.navigate('Send')
    }, {
      name: translate('components/ActionButtons', 'Receive'),
      icon: 'arrow-down-left',
      iconType: 'Feather',
      onPress: () => navigation.navigate('Receive')
    }, {
      name: translate('components/ActionButtons', 'Swap'),
      icon: 'repeat',
      iconType: 'Feather',
      onPress: () => navigation.navigate({
        name: 'Convert',
        params: { mode: 'utxosToAccount' },
        merge: true
      })
    }, {
      name: translate('components/ActionButtons', 'Transactions'),
      icon: 'calendar',
      iconType: 'Feather',
      onPress: () => navigation.navigate('TransactionsScreen')
    }
  ]

  if (isFeatureAvailable('future_swap')) {
    actions.splice(2, 0, {
      name: translate('components/ActionButtons', 'Future swap'),
      icon: 'clock',
      iconType: 'Feather',
      ...(futureSwaps.length > 0 && { badge: futureSwaps.length > 9 ? '9+' : futureSwaps.length + 1 }),
      onPress: () => navigation.navigate('FutureSwapScreen')
    })
  }

  return (
    <ScrollView
      contentContainerStyle={tailwind('px-5 my-8')}
      style={tailwind('flex-1')}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {actions.map((action: ActionButtonsProps) => (
        <ActionButton {...action} key={action.name} />
      ))}
    </ScrollView>
  )
}

function ActionButton (props: ActionButtonsProps): JSX.Element {
  return (
    <View style={tailwind('items-center')}>
      <ThemedTouchableOpacityV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-full w-15 h-15 items-center justify-center mx-2.5')}
        onPress={props.onPress}
      >
        <ThemedIcon
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          iconType={props.iconType}
          name={props.icon}
          size={28}
        />
        {props.badge !== undefined && (
          <View style={tailwind('bg-red-v2 rounded-full items-center justify-center h-4 w-4 absolute top-0 right-0')}>
            <Text style={tailwind('text-2xs font-bold-v2 text-mono-dark-v2-900')}>
              {props.badge}
            </Text>
          </View>
      )}
      </ThemedTouchableOpacityV2>
      <ThemedTextV2
        style={tailwind('text-xs font-normal-v2 text-center mt-2')}
      >
        {props.name}
      </ThemedTextV2>
    </View>
  )
}
