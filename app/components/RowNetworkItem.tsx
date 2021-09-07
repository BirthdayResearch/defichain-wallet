import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useNetworkContext } from '@contexts/NetworkContext'
import { EnvironmentNetwork, isPlayground } from '@environment'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import * as React from 'react'
import { useCallback } from 'react'
import { SettingsParamList } from '../screens/AppNavigator/screens/Settings/SettingsNavigator'

interface RowNetworkItemProps {
  network: EnvironmentNetwork
  alertMessage: string
}
export function RowNetworkItem (props: RowNetworkItemProps): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const { network, updateNetwork } = useNetworkContext()

  const onPress = useCallback(async () => {
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
  }, [props.network, props.alertMessage, network, navigation, updateNetwork])

  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      testID={`button_network_${props.network}`}
    >
      <ThemedText style={tailwind('font-medium')}>
        {props.network}
      </ThemedText>

      {
        props.network === network &&
        (
          <ThemedIcon
            dark={tailwind('text-darkprimary-500')}
            iconType='MaterialIcons'
            light={tailwind('text-primary-500')}
            name='check'
            size={24}
            testID={`button_network_${props.network}_check`}
          />
        )
      }
    </ThemedTouchableOpacity>
  )
}
