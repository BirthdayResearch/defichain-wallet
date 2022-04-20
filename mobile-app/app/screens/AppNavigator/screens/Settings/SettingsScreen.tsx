import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { Switch } from '@components/index'
import { WalletAlert } from '@components/WalletAlert'
import { usePrivacyLockContext } from '@contexts/LocalAuthContext'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { EnvironmentNetwork } from '@environment'
import { StackScreenProps } from '@react-navigation/stack'
import { authentication, Authentication } from '@store/authentication'
import { ocean } from '@store/ocean'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { RowThemeItem } from './components/RowThemeItem'
import { SettingsParamList } from './SettingsNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useAddressBook } from '@hooks/useAddressBook'

type Props = StackScreenProps<SettingsParamList, 'SettingsScreen'>

export function SettingsScreen ({ navigation }: Props): JSX.Element {
  const logger = useLogger()
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
      onError: e => logger.error(e),
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
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
      message: translate('screens/Settings', 'Enter passcode to continue'),
      loading: translate('screens/Settings', 'Verifying access')
    }

    dispatch(authentication.actions.prompt(auth))
  }, [walletContext.wallets[0], dispatch, navigation])

  return (
    <ThemedScrollView
      style={tailwind('flex-1 pb-8')}
      testID='setting_screen'
    >
      <ThemedSectionTitle
        testID='network_title'
        text={translate('screens/Settings', 'GENERAL')}
      />

      <SelectedNetworkItem
        network={network}
        onPress={() => {
          navigation.navigate('NetworkSelectionScreen')
        }}
      />
      <NavigateItemRow
        testID='address_book_title'
        label='Address Book'
        onPress={() => navigation.navigate('AddressBookScreen', {})}
      />

      <ThemedSectionTitle
        testID='security_title'
        text={translate('screens/Settings', 'SECURITY')}
      />
      {
        localAuth.isDeviceProtected && (
          <PrivacyLockToggle
            value={localAuth.isEnabled}
            onToggle={async () => {
              await localAuth.togglePrivacyLock()
            }}
            authenticationName={localAuth.getAuthenticationNaming()}
          />
        )
      }
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

      <ThemedSectionTitle
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
  const { clearAddressBook } = useAddressBook()

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
          onPress: async () => {
            clearAddressBook()
            await clearWallets()
          },
          style: 'destructive'
        }
      ]
    })
  }

  return (
    <ThemedTouchableOpacity
      onPress={onExitWallet}
      style={tailwind('flex flex-row p-4 mt-8 mb-8 items-center')}
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
  value,
  onToggle,
  authenticationName
}: { disabled?: boolean, value: boolean, onToggle: (newValue: boolean) => void, authenticationName?: string }): JSX.Element {
  return (
    <>
      <ThemedView
        light={tailwind('bg-white border-b border-gray-200')}
        dark={tailwind('bg-gray-800 border-b border-gray-700')}
        style={tailwind('flex p-4 pr-2 flex-row items-center justify-between')}
      >
        <ThemedText testID='text_privacy_lock' style={tailwind('font-medium')}>
          {authenticationName !== undefined &&
            translate('screens/Settings', 'Secure with {{option}}', { option: translate('screens/Settings', authenticationName) })}
        </ThemedText>
        <Switch
          onValueChange={onToggle}
          value={value}
          testID='switch_privacy_lock'
        />
      </ThemedView>
      <ThemedText
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
        style={tailwind('p-4 pt-2 mb-4 text-xs font-medium')}
      >
        {translate('screens/Settings', 'Auto-locks wallet if there is no activity for 1 min.')}
      </ThemedText>
    </>
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
