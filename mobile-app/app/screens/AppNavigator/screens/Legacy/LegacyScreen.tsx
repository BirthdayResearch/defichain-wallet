import { tailwind } from '@tailwind'
import { ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { StackScreenProps } from '@react-navigation/stack'
import { LegacyParamList } from './LegacyNavigator'
import { translate } from '@translations'
import { View } from '@components'
import { openURL } from '@api/linking'
import { LegacyAppIcon } from '@components/icons/LegacyAppIcon'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useDispatch } from 'react-redux'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWalletPersistenceContext, WalletType } from '@shared-contexts/WalletPersistenceContext'
import { useCallback } from 'react'
import { authentication, Authentication } from '@store/authentication'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'

type Props = StackScreenProps<LegacyParamList, 'LegacyScreen'>

export function LegacyScreen ({ navigation }: Props): JSX.Element {
  const dispatch = useDispatch()
  const logger = useLogger()
  const { wallets } = useWalletPersistenceContext()
  const { data: { type: encryptionType } } = useWalletNodeContext()
  const isEncrypted = encryptionType === WalletType.MNEMONIC_ENCRYPTED

  const handlePress = async (): Promise<void> => {
    /* TODO: Change to the actual link of new defichain app */
    await openURL('https://apps.apple.com/us/app/defichain-wallet/id1572472820')
  }

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

  return (
    <ThemedView
      testID='legacy_screen'
      style={tailwind('flex-1')}
      dark={tailwind('bg-black')}
    >
      <View style={tailwind('items-center justify-center h-full mx-4')}>
        <ThemedText
          light={tailwind('text-gray-900')}
          dark={tailwind('text-gray-50')}
          style={tailwind('font-semibold text-2xl')}
        >{translate('LegacyScreen', 'DeFiChain Wallet')}
        </ThemedText>
        <ThemedView
          light={tailwind('bg-gray-100')}
          dark={tailwind('bg-gray-900')}
          style={tailwind('px-3 py-1 mb-4 rounded-lg')}
        >
          <ThemedText
            light={tailwind('text-gray-900')}
            dark={tailwind('text-gray-50')}
            style={tailwind('text-sm font-medium')}
          >{translate('LegacyScreen', 'LEGACY')}
          </ThemedText>
        </ThemedView>
        <ThemedText
          style={tailwind('text-center mb-4')}
        >{translate('LegacyScreen', 'A new, identical DeFiChain Wallet app has been created to replace this app.')}
        </ThemedText>
        <ThemedText
          style={tailwind('text-center')}
        >{translate('LegacyScreen', 'To continue, download the new Wallet on the App Store.')}
        </ThemedText>

        <View style={tailwind('flex flex-row justify-between items-center mt-12 text-center')}>
          <ThemedTouchableOpacity
            onPress={handlePress}
            light={tailwind('border-gray-300 bg-white')}
            dark={tailwind('border-gray-400 bg-gray-900')}
            style={tailwind('border rounded-lg')}
          >
            <LegacyAppIcon />
          </ThemedTouchableOpacity>
          {(isEncrypted && wallets.length > 0) && (
            <ThemedTouchableOpacity
              onPress={revealRecoveryWords}
              light={tailwind('border-gray-300 bg-white')}
              dark={tailwind('border-gray-400 bg-gray-900')}
              style={tailwind('p-3 ml-2 w-6/12 border rounded-lg')}
            >
              <ThemedText
                light={tailwind('text-primary-500')}
                dark={tailwind('text-darkprimary-500')}
                style={tailwind('text-sm font-medium leading-4 text-center')}
              >
                {translate('screens/LegacyScreen', 'VIEW RECOVERY WORDS')}
              </ThemedText>
            </ThemedTouchableOpacity>
          )}
        </View>
      </View>
    </ThemedView>
  )
}
