import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { initJellyfishWallet, MnemonicEncrypted } from '@api/wallet'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { View } from '@components/index'
import { CREATE_STEPS, CreateWalletStepIndicator, RESTORE_STEPS } from '@components/CreateWalletStepIndicator'
import { PinTextInput } from '@components/PinTextInput'
import { ThemedActivityIndicator, ThemedScrollView, ThemedText } from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletPersistenceContext, WalletPersistenceDataI } from '@shared-contexts/WalletPersistenceContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '@screens/WalletNavigator/WalletNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MAX_ALLOWED_ADDRESSES } from '@shared-contexts/WalletContext'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>

export function PinConfirmation ({ route }: Props): JSX.Element {
  const logger = useLogger()
  const { network } = useNetworkContext()
  const { setWallet } = useWalletPersistenceContext()
  const client = useWhaleApiClient()
  const {
    pin,
    words,
    type
  } = route.params
  const [newPin, setNewPin] = useState('')

  const [invalid, setInvalid] = useState<boolean>(false)
  const [spinnerMessage, setSpinnerMessage] = useState<string>()

  function verifyPin (input: string): void {
    if (input.length !== pin.length) {
      return
    }
    if (input !== pin) {
      setNewPin('')
      setInvalid(true)
      return
    } else {
      setInvalid(false)
    }

    const copy = { words, network, pin }
    setSpinnerMessage(translate('screens/PinConfirmation', 'It may take a few seconds to securely encrypt your wallet...'))
    setTimeout(() => {
      MnemonicEncrypted.toData(copy.words, copy.network, copy.pin)
        .then(async encrypted => {
          await MnemonicStorage.set(words, pin)
          if (type === 'restore') {
            await discoverWalletAddresses(encrypted)
          }
          await setWallet(encrypted)
        })
        .catch(logger.error)
    }, 50) // allow UI render the spinner before async task
  }

  async function discoverWalletAddresses (data: WalletPersistenceDataI<EncryptedProviderData>): Promise<void> {
    const provider = await MnemonicEncrypted.initProvider(data, network, {
      /**
       * wallet context only use for READ purpose (non signing)
       * see {@link TransactionAuthorization} for signing implementation
       */
      async prompt () {
        throw new Error('No UI attached for passphrase prompting')
      }
    })
    const wallet = await initJellyfishWallet(provider, network, client)

    // get discovered address
    const activeAddress = await wallet.discover(MAX_ALLOWED_ADDRESSES)

    // sub 1 from total discovered address to get address index of last active address
    const lastDiscoveredAddressIndex = Math.max(0, activeAddress.length - 1)
    await WalletAddressIndexPersistence.setLength(lastDiscoveredAddressIndex)
  }

  return (
    <ThemedScrollView
      dark={tailwind('bg-gray-900')}
      light={tailwind('bg-white')}
      style={tailwind('w-full flex-1 flex-col')}
    >
      <CreateWalletStepIndicator
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />

      <View style={tailwind('px-6 py-4 mb-6')}>
        <ThemedText
          style={tailwind('text-center font-semibold')}
        >
          {translate('screens/PinConfirmation', 'Enter your passcode again to verify')}
        </ThemedText>
      </View>

      <PinTextInput
        cellCount={6}
        onChange={(pin) => {
          setNewPin(pin)
          verifyPin(pin)
        }}
        testID='pin_confirm_input'
        value={newPin}
      />

      <View style={tailwind('flex-row justify-center mt-6')}>
        {
          (spinnerMessage !== undefined)
            ? (
              <View style={tailwind('items-center px-4')}>
                <ThemedActivityIndicator style={tailwind('mb-4')} />

                <ThemedText
                  style={tailwind('ml-2 font-semibold text-sm text-center w-4/6 px-4')}
                >
                  {spinnerMessage}
                </ThemedText>
              </View>
              )
            : null
        }

        {
          invalid && (
            <ThemedText
              dark={tailwind('text-darkerror-500')}
              light={tailwind('text-error-500')}
              style={tailwind('text-center font-semibold text-sm')}
              testID='wrong_passcode_text'
            >
              {translate('screens/PinConfirmation', 'Wrong passcode entered')}
            </ThemedText>
          )
        }
      </View>
    </ThemedScrollView>
  )
}
