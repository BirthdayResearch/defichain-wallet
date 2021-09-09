import { Logging } from '@api'
import { Switch } from '@components/index'
import { SectionTitle } from '@components/SectionTitle'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { usePrivacyLockContext } from '@contexts/LocalAuthContext'
import { useNetworkContext } from '@contexts/NetworkContext'
import { useWalletNodeContext } from '@contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@contexts/WalletPersistenceContext'
import { EnvironmentNetwork } from '@environment'
import { StackScreenProps } from '@react-navigation/stack'
import { authentication, Authentication } from '@store/authentication'
import { ocean } from '@store/ocean'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import * as React from 'react'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { MnemonicStorage } from '../../../../api/wallet/mnemonic_storage'
import { RowThemeItem } from './components/RowThemeItem'
import { SettingsParamList } from './SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'SettingsScreen'>

export function SettingsScreen ({ navigation }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const dispatch = useDispatch()
  const walletContext = useWalletPersistenceContext()
  const localAuth = usePrivacyLockContext()
  const { data: { type } } = useWalletNodeContext()
  const isEncrypted = type === 'MNEMONIC_ENCRYPTED'

  const revealRecoveryWords = useCallback(() => {
    if (!isEncrypted) {
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async (words) => {
        navigation.navigate({
          name: 'RecoveryWordsScreen',
          params: { words },
          merge: true
        })
      },
      onError: e => Logging.error(e),
      message: translate('screens/Settings', 'To continue viewing your recovery words, we need you to enter your passcode.'),
      loading: translate('screens/Settings', 'Loading...')
    }
    dispatch(authentication.actions.prompt(auth))
  }, [dispatch, isEncrypted, navigation])

  const changePasscode = useCallback(() => {
    if (!isEncrypted) {
      return
    }

    const auth: Authentication<string[]> = {
      consume: async passphrase => await MnemonicStorage.get(passphrase),
      onAuthenticated: async words => {
        navigation.navigate({
          name: 'ChangePinScreen',
          params: {
            words,
            pinLength: 6
          },
          merge: true
        })
      },
      onError: (e) => {
        dispatch(ocean.actions.setError(e))
      },
      message: translate('screens/Settings', 'To update your passcode, we need you to enter your current passcode.'),
      loading: translate('screens/Settings', 'Verifying passcode...')
    }

    dispatch(authentication.actions.prompt(auth))
  }, [walletContext.wallets[0], dispatch, navigation])

  return (
    <ThemedScrollView
      style={tailwind('flex-1 pb-8')}
      testID='setting_screen'
    >
      <SectionTitle
        testID='network_title'
        text={translate('screens/Settings', 'NETWORK')}
      />

      <SelectedNetworkItem
        network={network}
        onPress={() => {
          navigation.navigate('NetworkSelectionScreen')
        }}
      />

      <SectionTitle
        testID='security_title'
        text={translate('screens/Settings', 'SECURITY')}
      />
      <PrivacyLockToggle
        disabled={!localAuth.isDeviceProtected}
        value={localAuth.isEnabled}
        onToggle={async () => {
          await localAuth.togglePrivacyLock()
        }}
      />
      {
        isEncrypted && (
          <>
            <NavigateItemRow
              label='Recovery Words'
              onPress={revealRecoveryWords}
              testID='view_recovery_words'
            />
            <NavigateItemRow
              label='Change Passcode'
              onPress={changePasscode}
              testID='view_change_passcode'
            />
          </>
        )
      }
      <SectionTitle
        testID='addtional_options_title'
        text={translate('screens/Settings', 'ADDITIONAL OPTIONS')}
      />
      <NavigateItemRow
        testID='setting_navigate_About'
        label='About'
        onPress={() => navigation.navigate('AboutScreen')}
      />
      <RowThemeItem />
      <NavigateItemRow
        testID='setting_navigate_language_selection'
        label='Language'
        onPress={() => navigation.navigate('LanguageSelectionScreen')}
      />
      <RowExitWalletItem />
    </ThemedScrollView>
  )
}

function SelectedNetworkItem ({
  network,
  onPress
}: { network: EnvironmentNetwork, onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      testID='button_selected_network'
    >
      <ThemedText style={tailwind('font-medium')}>
        {network}
      </ThemedText>

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
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
    <ThemedTouchableOpacity
      onPress={onExitWallet}
      style={tailwind('flex flex-row p-4 mt-8 items-center')}
      testID='setting_exit_wallet'
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name='exit-to-app'
        size={24}
        style={[tailwind('self-center mr-2'), { transform: [{ scaleX: -1 }] }]}
      />

      <ThemedText
        dark={tailwind('text-darkprimary-500')}
        light={tailwind('text-primary-500')}
        style={tailwind('font-medium')}
      >
        {translate('screens/Settings', 'UNLINK WALLET')}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}

function PrivacyLockToggle ({
  disabled = false,
  value,
  onToggle
}: { disabled?: boolean, value: boolean, onToggle: (newValue: boolean) => void }): JSX.Element {
  const textStyleProp = disabled ? { color: 'gray' } : {}
  return (
    <ThemedView
      light={tailwind('bg-white border-b border-gray-200')}
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      style={tailwind('flex p-4 pr-2 flex-row items-center justify-between')}
    >
      <ThemedText testID='text_privacy_lock' style={[tailwind('font-medium'), textStyleProp]}>
        {translate('screens/Settings', 'Privacy Lock')}
      </ThemedText>
      <Switch
        disabled={disabled}
        onValueChange={onToggle}
        value={value}
        testID='switch_privacy_lock'
      />
    </ThemedView>
  )
}

function NavigateItemRow ({
  testID,
  label,
  onPress
}: { testID: string, label: string, onPress: () => void }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={onPress}
      style={tailwind('flex p-4 pr-2 flex-row items-center justify-between')}
      testID={testID}
    >
      <ThemedText style={tailwind('font-medium')}>
        {translate('screens/Settings', label)}
      </ThemedText>

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
  )
}
