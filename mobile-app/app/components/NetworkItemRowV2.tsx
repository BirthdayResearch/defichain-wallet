import { ThemedIcon } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { EnvironmentNetwork, isPlayground } from '@environment'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { SettingsParamList } from '@screens/AppNavigator/screens/Settings/SettingsNavigator'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { ThemedTextV2 } from './themed/ThemedTextV2'
import { ThemedTouchableOpacityV2 } from './themed/ThemedTouchableOpacityV2'

interface NetworkItemRowProps {
  network: EnvironmentNetwork
  alertMessage: string
  isLast: boolean
}

export function NetworkItemRowV2 (props: NetworkItemRowProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const {
    network,
    updateNetwork
  } = useNetworkContext()

  const onPress = async (): Promise<void> => {
    if (props.network === network) {
      if (isPlayground(props.network)) {
        navigation.navigate('Playground')
      }
    } else {
      WalletAlert({
        title: translate('screens/Settings', 'Network Switch'),
        message: props.alertMessage,
        buttons: [
          {
            text: translate('screens/Settings', 'No'),
            style: 'cancel'
          },
          {
            text: translate('screens/Settings', 'Yes'),
            style: 'destructive',
            onPress: async () => {
              await updateNetwork(props.network)
            }
          }
        ]
      })
    }
  }

  return (
    <ThemedTouchableOpacityV2
      onPress={onPress}
      style={tailwind('flex-row py-4.5 items-center justify-between border-b', { 'border-0': props.isLast })}
      light={tailwind('border-mono-light-v2-300')}
      dark={tailwind('border-mono-dark-v2-300')}
      testID={`button_network_${props.network}`}
    >
      <ThemedTextV2 style={tailwind('text-sm font-normal-v2')}>
        {props.network}
      </ThemedTextV2>

      <ThemedIcon
        light={tailwind({ 'text-green-v2': props.network === network, 'text-light-mono-v2-700': props.network !== network })}
        dark={tailwind({ 'text-green-v2': props.network === network, 'text-dark-mono-v2-700': props.network !== network })}
        iconType='MaterialCommunityIcons'
        name='check-circle'
        size={18}
        testID={`button_network_${props.network}_check`}
      />
    </ThemedTouchableOpacityV2>
  )
}
