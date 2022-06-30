import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { initJellyfishWallet, MnemonicEncrypted } from '@api/wallet'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { View } from '@components/index'
import { CREATE_STEPS, RESTORE_STEPS } from '@components/CreateWalletStepIndicator'
import { ThemedActivityIndicator, ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
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
import { CreateWalletStepIndicatorV2 } from '@components/CreateWalletStepIndicatorV2'
import { PinTextInputV2 } from '@components/PinTextInputV2'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>

export function PinConfirmationV2 ({ route }: Props): JSX.Element {
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
    setSpinnerMessage(translate('screens/PinConfirmation', 'It may take a few seconds to secure and encrypt your wallet'))
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
    <ThemedScrollViewV2
      style={tailwind('w-full flex-1 flex-col')}
      contentContainerStyle={tailwind('pt-12')}
    >
      <CreateWalletStepIndicatorV2
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-0.5 px-3')}
      />

      <View style={tailwind('px-10')}>
        <ThemedTextV2
          style={tailwind(['text-center font-normal-v2 mt-7', { 'mb-20': spinnerMessage === undefined }])}
        >
          {translate('screens/PinCreation', 'Add an additional layer of security by setting a passcode.')}
        </ThemedTextV2>
        {
          (spinnerMessage !== undefined) && (
            <ThemedActivityIndicator style={tailwind('my-7')} />
          )
        }
      </View>

      <PinTextInputV2
        cellCount={6}
        onChange={(pin) => {
          setNewPin(pin)
          verifyPin(pin)
        }}
        testID='pin_confirm_input'
        value={newPin}
      />

      <View style={tailwind('mt-1')}>
        {
          (spinnerMessage !== undefined) && (
            <ThemedTextV2
              style={tailwind('font-normal-v2 text-sm text-center px-12')}
            >
              {spinnerMessage}
            </ThemedTextV2>
            )
        }
        {
          (spinnerMessage === undefined && !invalid) && (
            (
              <ThemedTextV2
                style={tailwind('text-sm font-normal-v2 text-center')}
              >
                {translate('screens/PinConfirmation', 'Enter passcode for verification')}
              </ThemedTextV2>
            )
          )
        }
        {
          invalid && (
            <ThemedTextV2
              style={tailwind('text-center font-normal-v2 text-sm text-red-v2')}
              light={tailwind('text-red-v2')}
              dark={tailwind('text-red-v2')}
              testID='wrong_passcode_text'
            >
              {translate('screens/PinConfirmation', 'Wrong passcode entered')}
            </ThemedTextV2>
          )
        }
      </View>
    </ThemedScrollViewV2>
  )
}
