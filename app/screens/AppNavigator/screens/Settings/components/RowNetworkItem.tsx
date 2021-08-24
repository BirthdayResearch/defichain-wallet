import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { useCallback } from 'react'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from '../../../../../components/themed'
import { WalletAlert } from '../../../../../components/WalletAlert'
import { useNetworkContext } from '../../../../../contexts/NetworkContext'
import { EnvironmentNetwork, isPlayground } from '../../../../../environment'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { SettingsParamList } from '../SettingsNavigator'

export function RowNetworkItem (props: { network: EnvironmentNetwork }): JSX.Element {
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
        message: translate(
          'screens/Settings', `You are about to switch to ${props.network}. If there is no existing wallet on this network, you will be redirected to Onboarding screen. Do you want to proceed?`),
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
      }
      )
    }
  }, [network])

  return (
    <ThemedTouchableOpacity
      testID={`button_network_${props.network}`}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      onPress={onPress}
    >
      <ThemedText style={tailwind('font-medium')}>
        {props.network}
      </ThemedText>

      {
        props.network === network &&
        (
          <ThemedIcon
            iconType='MaterialIcons'
            testID={`button_network_${props.network}_check`} size={24} name='check'
            light='text-primary-500' dark='text-darkprimary'
          />
        )
      }
    </ThemedTouchableOpacity>
  )
}
