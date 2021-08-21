import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useCallback } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import { Logging } from '../../../../api'
import { MnemonicStorage } from '../../../../api/wallet/mnemonic_storage'
import { Text } from '../../../../components'
import { SectionTitle } from '../../../../components/SectionTitle'
import { WalletAlert } from '../../../../components/WalletAlert'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useThemeContext } from '../../../../contexts/ThemeProvider'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { EnvironmentNetwork } from '../../../../environment'
import { authentication, Authentication } from '../../../../store/authentication'
import { ocean } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { RowThemeItem } from './components/RowThemeItem'
import { SettingsParamList } from './SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'SettingsScreen'>

export function SettingsScreen ({ navigation }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const dispatch = useDispatch()
  const walletContext = useWalletPersistenceContext()
  const isEncrypted = walletContext.wallets[0].type === 'MNEMONIC_ENCRYPTED'
  const { getThemeClass } = useThemeContext()

  const revealRecoveryWords = useCallback(() => {
    if (!isEncrypted) {
      // TODO: alert(mnemonic phrase only get encrypted and stored if for encrypted type)
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async (words) => {
        navigation.navigate({ name: 'RecoveryWordsScreen', params: { words }, merge: true })
      },
      onError: e => Logging.error(e),
      message: translate('screens/Settings', 'To continue viewing your recovery words, we need you to enter your passcode.'),
      loading: translate('screens/Settings', 'Loading...')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [walletContext.wallets[0]])

  const changePasscode = useCallback(() => {
    if (walletContext.wallets[0].type !== 'MNEMONIC_ENCRYPTED') {
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async words => {
        navigation.navigate({
          name: 'ChangePinScreen', params: { words, pinLength: 6 }, merge: true
        })
      },
      onError: (e) => {
        dispatch(ocean.actions.setError(e))
      },
      message: translate('screens/Settings', 'To update your passcode, we need you to enter your current passcode.'),
      loading: translate('screens/Settings', 'Verifying passcode...')
    }

    dispatch(authentication.actions.prompt(auth))
  }, [walletContext.wallets[0]])

  return (
    <ScrollView style={tailwind('flex-1 pb-8', getThemeClass('body-bg'))} testID='setting_screen'>
      <SectionTitle text={translate('screens/Settings', 'NETWORK')} testID='network_title' />
      <SelectedNetworkItem
        network={network} onPress={() => {
          navigation.navigate('NetworkSelectionScreen')
        }}
      />
      <SectionTitle text={translate('screens/Settings', 'SECURITY')} testID='security_title' />
      <SecurityRow testID='view_recovery_words' label='Recovery Words' onPress={revealRecoveryWords} />
      {
        isEncrypted && <SecurityRow testID='view_change_passcode' label='Change Passcode' onPress={changePasscode} />
      }
      <RowThemeItem />
      <RowNavigateItem pageName='AboutScreen' title='About' />
      <RowExitWalletItem />
    </ScrollView>
  )
}

function SelectedNetworkItem ({ network, onPress }: { network: EnvironmentNetwork, onPress: () => void }): JSX.Element {
  const { getThemeClass } = useThemeContext()
  return (
    <TouchableOpacity
      testID='button_selected_network'
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between', getThemeClass('row-bg row-border'))}
      onPress={onPress}
    >
      <Text style={tailwind('font-medium', getThemeClass('body-text'))}>
        {network}
      </Text>
      <MaterialIcons
        size={24}
        name='chevron-right'
        style={tailwind(getThemeClass('body-text'))}
      />
    </TouchableOpacity>
  )
}

function RowExitWalletItem (): JSX.Element {
  const { getThemeClass } = useThemeContext()
  const { clearWallets } = useWalletPersistenceContext()

  async function onExitWallet (): Promise<void> {
    WalletAlert({
      title: translate('screens/Settings', 'Are you sure you want to unlink your wallet?'),
      message: translate('screens/Settings', 'You will need to use your recovery words the next time you want to get back to your wallet.'),
      buttons: [
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
    })
  }

  return (
    <TouchableOpacity
      testID='setting_exit_wallet'
      onPress={onExitWallet} style={tailwind('flex flex-row p-4 mt-8 items-center', getThemeClass('row-bg row-border'))}
    >
      <MaterialIcons
        name='exit-to-app'
        style={[tailwind('self-center mr-2', getThemeClass('text-primary')), { transform: [{ scaleX: -1 }] }]}
        size={24}
      />
      <Text style={tailwind('font-medium', getThemeClass('text-primary'))}>
        {translate('screens/Settings', 'UNLINK WALLET')}
      </Text>
    </TouchableOpacity>
  )
}

function SecurityRow ({ testID, label, onPress }: { testID: string, label: string, onPress: () => void }): JSX.Element {
  const { getThemeClass } = useThemeContext()
  return (
    <TouchableOpacity
      testID={testID}
      style={tailwind('flex p-4 pr-2 flex-row items-center justify-between', getThemeClass('row-bg row-border'))}
      onPress={onPress}
    >
      <Text style={tailwind('font-medium', getThemeClass('body-text'))}>
        {translate('screens/Settings', label)}
      </Text>
      <MaterialIcons
        name='chevron-right'
        style={[tailwind('text-black', getThemeClass('body-text'))]}
        size={24}
      />
    </TouchableOpacity>
  )
}

function RowNavigateItem ({ pageName, title }: { pageName: string, title: string }): JSX.Element {
  const { getThemeClass } = useThemeContext()
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  return (
    <TouchableOpacity
      testID={`setting_navigate_${title}`}
      onPress={() => {
        navigation.navigate(pageName)
      }} style={tailwind('flex flex-row p-4 pr-2 mt-4 items-center', getThemeClass('row-bg row-border'))}
    >
      <Text style={tailwind('font-medium flex-grow', getThemeClass('body-text'))}>
        {translate('screens/Settings', title)}
      </Text>
      <MaterialIcons name='chevron-right' size={24} style={tailwind(getThemeClass('body-text'))} />
    </TouchableOpacity>
  )
}
