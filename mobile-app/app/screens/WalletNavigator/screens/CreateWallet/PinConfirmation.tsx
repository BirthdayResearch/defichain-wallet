import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { MnemonicEncrypted } from '@api/wallet'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { View } from '@components/index'
import { CREATE_STEPS, CreateWalletStepIndicator, RESTORE_STEPS } from '@components/CreateWalletStepIndicator'
import { PinTextInput } from '@components/PinTextInput'
import { ThemedActivityIndicator, ThemedScrollView, ThemedText } from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '@screens/WalletNavigator/WalletNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>

export function PinConfirmation ({ route }: Props): JSX.Element {
  const logger = useLogger()
  const { network } = useNetworkContext()
  const { setWallet } = useWalletPersistenceContext()
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
          await setWallet(encrypted)
        })
        .catch(logger.error)
    }, 50) // allow UI render the spinner before async task
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
