import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { useCallback } from 'react'
import { Alert, Platform, ScrollView, TouchableOpacity } from 'react-native'
import { Text } from '../../../../components'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { EnvironmentNetwork, getEnvironment, isPlayground } from '../../../../environment'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'

export function SettingsScreen (): JSX.Element {
  const networks = getEnvironment().networks

  return (
    <ScrollView style={tailwind('flex-1 bg-gray-100')}>
      <SectionTitle text={translate('screens/Settings', 'NETWORK')} testID='network_title' />
      {
        networks.map((network, index) => (
          <RowNetworkItem key={index} network={network} />
        ))
      }
      <SectionTitle text={translate('screens/Settings', 'SUPPORT')} testID='tools_and_support_title' />
      <RowNavigateItem pageName='AboutScreen' title='About' />
      <RowExitWalletItem />
    </ScrollView>
  )
}

function RowNetworkItem (props: { network: EnvironmentNetwork }): JSX.Element {
  const navigation = useNavigation()
  const { network, updateNetwork } = useNetworkContext()

  const onPress = useCallback(async () => {
    if (props.network === network) {
      if (isPlayground(props.network)) {
        navigation.navigate('Playground')
      }
    } else {
      await updateNetwork(props.network)
    }
  }, [network])

  return (
    <TouchableOpacity
      testID={`button_network_${props.network}`}
      style={tailwind('flex-row p-4 bg-white items-center justify-between border-b border-gray-200')}
      onPress={onPress}
    >
      <Text style={tailwind('font-medium')}>
        {props.network}
      </Text>

      {
        props.network === network &&
        (
          <MaterialIcons
            testID={`button_network_${props.network}_check`} size={24} name='check'
            style={tailwind('text-primary')}
          />
        )
      }
    </TouchableOpacity>
  )
}

function RowExitWalletItem (): JSX.Element {
  const { clearWallets } = useWalletPersistenceContext()

  async function onExitWallet (): Promise<void> {
    if (Platform.OS === 'web') {
      await clearWallets()
    } else {
      Alert.alert(
        translate('screens/Settings', 'Are you sure you want to unlink your wallet?'),
        translate('screens/Settings', 'You will need to use your recovery words the next time you want to get back to your wallet.'),
        [
          {
            text: translate('screens/Settings', 'Cancel'),
            style: 'cancel'
          },
          {
            text: translate('screens/Settings', 'Unlink Wallet'),
            onPress: async () => await clearWallets(),
            style: 'destructive'
          }
        ]
      )
    }
  }

  return (
    <TouchableOpacity
      testID='setting_exit_wallet'
      onPress={onExitWallet} style={tailwind('flex bg-white flex-row p-4 mt-8 items-center')}
    >
      <MaterialIcons
        name='exit-to-app'
        style={[tailwind('text-primary mr-2'), { transform: [{ scaleX: -1 }] }]}
        size={24}
      />
      <Text style={tailwind('font-medium text-primary')}>
        {translate('screens/Settings', 'UNLINK WALLET')}
      </Text>
    </TouchableOpacity>
  )
}

function RowNavigateItem ({ pageName, title }: { pageName: string, title: string }): JSX.Element {
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      testID={`setting_navigate_${title}`}
      onPress={() => {
        navigation.navigate(pageName)
      }} style={tailwind('flex bg-white flex-row p-4 pr-2 items-center')}
    >
      <Text style={tailwind('font-medium flex-grow')}>
        {translate('screens/Settings', title)}
      </Text>
      <MaterialIcons name='chevron-right' size={24} />
    </TouchableOpacity>
  )
}
