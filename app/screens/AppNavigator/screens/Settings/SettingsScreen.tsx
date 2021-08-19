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
import { useLocalAuthContext } from '../../../../contexts/LocalAuthContext'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { EnvironmentNetwork } from '../../../../environment'
import { authentication, Authentication } from '../../../../store/authentication'
import { ocean } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { SettingsParamList } from './SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'SettingsScreen'>

export function SettingsScreen ({ navigation }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const dispatch = useDispatch()
  const walletContext = useWalletPersistenceContext()
  const { isEncrypted } = walletContext
  const localAuth = useLocalAuthContext()

  const revealRecoveryWords = useCallback(() => {
    if (!isEncrypted) {
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async (words) => {
        navigation.navigate({ name: 'RecoveryWordsScreen', params: { words }, merge: true })
      },
      onError: e => Logging.error(e),
      message: translate('screens/Settings', 'To continue downloading your recovery words, we need you to enter your passcode.'),
      loading: translate('screens/Settings', 'Decrypting recovering words...')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [walletContext.wallets[0]])

  const changePasscode = useCallback(() => {
    if (!isEncrypted) {
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
    <ScrollView style={tailwind('flex-1 bg-gray-100 pb-8')} testID='setting_screen'>
      <SectionTitle text={translate('screens/Settings', 'NETWORK')} testID='network_title' />
      <SelectedNetworkItem network={network} onPress={() => { navigation.navigate('NetworkSelectionScreen') }} />
      <SectionTitle text={translate('screens/Settings', 'SECURITY')} testID='security_title' />
      {/* <SecurityRow disabled={isEncrypted} label='Encrypt your wallet' /> */}
      <SecurityRow
        disabled={!isEncrypted}
        testID='view_recovery_words'
        label='Recovery Words'
        onPress={revealRecoveryWords}
      />
      <SecurityRow
        disabled={!isEncrypted}
        testID='view_change_passcode'
        label='Change Passcode'
        onPress={changePasscode}
      />
      <SecurityRow
        disabled={!localAuth.isDeviceProtected}
        testID='view_toggle_privacy_lock'
        label={translate('screens/Settings', localAuth.isPrivacyLock === true ? 'Disable Privacy Lock' : 'Enable Privacy Lock (require hardware)')}
        onPress={async () => {
          await localAuth.togglePrivacyLock()
        }}
      />
      <RowNavigateItem pageName='AboutScreen' title='About' />
      <RowExitWalletItem />
    </ScrollView>
  )
}

function SelectedNetworkItem ({ network, onPress }: { network: EnvironmentNetwork, onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID='button_selected_network'
      style={tailwind('flex flex-row p-4 pr-2 bg-white items-center justify-between border-b border-gray-200')}
      onPress={onPress}
    >
      <Text style={tailwind('font-medium')}>
        {network}
      </Text>
      <MaterialIcons
        size={24}
        name='chevron-right'
      />
    </TouchableOpacity>
  )
}

function RowExitWalletItem (): JSX.Element {
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
      onPress={onExitWallet} style={tailwind('flex bg-white flex-row p-4 mt-8 items-center')}
    >
      <MaterialIcons
        name='exit-to-app'
        style={[tailwind('self-center text-primary mr-2'), { transform: [{ scaleX: -1 }] }]}
        size={24}
      />
      <Text style={tailwind('font-medium text-primary')}>
        {translate('screens/Settings', 'UNLINK WALLET')}
      </Text>
    </TouchableOpacity>
  )
}

function SecurityRow ({ disabled = false, testID, label, onPress }: { disabled?: boolean, testID: string, label: string, onPress: () => void }): JSX.Element | null {
  const textStyleProp = disabled ? { color: 'gray' } : {}
  return (
    <TouchableOpacity
      disabled={disabled}
      testID={testID}
      style={tailwind('flex bg-white p-4 pr-2 flex-row items-center justify-between border-b border-gray-200')}
      onPress={onPress}
    >
      <Text style={[tailwind('font-medium'), textStyleProp]}>
        {translate('screens/Settings', label)}
      </Text>
      <MaterialIcons
        name='chevron-right'
        style={[tailwind('text-black')]}
        size={24}
      />
    </TouchableOpacity>
  )
}

function RowNavigateItem ({ pageName, title }: { pageName: string, title: string }): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
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
