import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Alert, Platform, ScrollView, TouchableOpacity } from 'react-native'
import { Logging } from '../../../../api'
import { Text } from '../../../../components'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { EnvironmentNetwork, getEnvironment, isPlayground } from '../../../../environment'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { SettingsParamList } from './SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'SettingsScreen'>

export function SettingsScreen ({ navigation }: Props): JSX.Element {
  const networks = getEnvironment().networks
  const [words, setWords] = useState<string[]>([])
  const getRecoveryWords = (): void => {
    getMockRecoveryWords().then((words) => {
      setWords(words)
    }).catch(Logging.error)
  }

  useEffect(() => {
    getRecoveryWords()
  }, [])

  return (
    <ScrollView style={tailwind('flex-1 bg-gray-100')}>
      <SectionTitle text={translate('screens/Settings', 'NETWORK')} testID='network_title' />
      {
        networks.map((network, index) => (
          <RowNetworkItem key={index} network={network} />
        ))
      }
      <SectionTitle text={translate('screens/Settings', 'SECURITY')} testID='security_title' />
      <ViewRecoveryWords onPress={() => {
        navigation.navigate('RecoveryWordsScreen', { words })
      }}
      />
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

function ViewRecoveryWords ({ onPress }: { onPress: () => void}): JSX.Element {
  return (
    <TouchableOpacity
      testID='view_recovery_words'
      style={tailwind('bg-white p-4 flex-row items-center justify-between border-b border-gray-200')}
      onPress={onPress}
    >
      <Text style={tailwind('font-medium')}>
        {translate('screens/Settings', 'Recovery Words')}
      </Text>
      <MaterialIcons
        name='chevron-right'
        style={[tailwind('text-black')]}
        size={24}
      />
    </TouchableOpacity>
  )
}

async function getMockRecoveryWords (): Promise<string[]> {
  // TODO(kengye): integrate with jellyfish api to retrieve mnemonic seeds
  return ['bunker', 'layer', 'kid', 'involve', 'flight', 'figure', 'gauge', 'ticket', 'final', 'beach', 'basic', 'aspect', 'exit', 'slow', 'high', 'aerobic', 'sister', 'device', 'bullet', 'twin', 'profit', 'scale', 'sell', 'find']
}

function RowNavigateItem ({ pageName, title }: { pageName: string, title: string }): JSX.Element {
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      testID={`setting_navigate_${title}`}
      onPress={() => {
        navigation.navigate(pageName)
      }} style={tailwind('flex bg-white flex-row p-4 pr-2 mt-4 items-center')}
    >
      <Text style={tailwind('font-medium flex-grow')}>
        {translate('screens/Settings', title)}
      </Text>
      <MaterialIcons name='chevron-right' size={24} />
    </TouchableOpacity>
  )
}
