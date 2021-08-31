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
      // TODO(@thedoublejay) Update to pass params for translations
      WalletAlert({
        title: translate('screens/Settings', 'Network Switch'),
        message: translate(
          'screens/Settings', 'You are about to switch to {{network}}. If there is no existing wallet on this network, you will be redirected to Onboarding screen. Do you want to proceed?', { network: props.network }),
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
