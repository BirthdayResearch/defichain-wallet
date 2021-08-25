// import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { Logging } from '../../../../api'
import { MnemonicEncrypted } from '../../../../api/wallet'
import { MnemonicStorage } from '../../../../api/wallet/mnemonic_storage'
import { View } from '../../../../components'
import {
  CREATE_STEPS,
  CreateWalletStepIndicator,
  RESTORE_STEPS
} from '../../../../components/CreateWalletStepIndicator'
import { PinTextInput } from '../../../../components/PinTextInput'
import { ThemedScrollView, ThemedText } from '../../../../components/themed'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>

export function PinConfirmation ({ route }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const { setWallet } = useWalletPersistenceContext()
  // const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const { pin, words, type } = route.params
  const [newPin, setNewPin] = useState('')

  const [invalid, setInvalid] = useState<boolean>(false)
  const [spinnerMessage, setSpinnerMessage] = useState<string>()

  function verifyPin (input: string): void {
    if (input.length !== pin.length) return
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
        .catch(e => Logging.error(e))
    }, 50) // allow UI render the spinner before async task
  }

  return (
    <ThemedScrollView light='bg-white' dark='bg-gray-900' style={tailwind('w-full flex-1 flex-col')}>
      <CreateWalletStepIndicator
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />
      <View style={tailwind('px-6 py-4 mb-6')}>
        <ThemedText
          style={tailwind('text-center font-semibold')}
        >{translate('screens/PinConfirmation', 'Enter your passcode again to verify')}
        </ThemedText>
      </View>
      <PinTextInput
        cellCount={6} testID='pin_confirm_input' value={newPin} onChange={(pin) => {
          setNewPin(pin)
          verifyPin(pin)
        }}
      />
      <View style={tailwind('flex-row justify-center mt-6')}>
        {
          (spinnerMessage !== undefined)
            ? (
              <View style={tailwind('items-center')}>
                <ActivityIndicator color='#FF00AF' style={tailwind('mb-4')} />
                <ThemedText
                  style={tailwind('ml-2 font-semibold text-sm text-center w-4/5')}
                >{spinnerMessage}
                </ThemedText>
              </View>
              )
            : null
        }
        {
          invalid && (
            <ThemedText
              light='text-error-500' dark='text-darkerror-500' testID='wrong_passcode_text'
              style={tailwind('text-center font-semibold text-sm')}
            >
              {translate('screens/PinConfirmation', 'Wrong passcode entered')}
            </ThemedText>
          )
        }
      </View>
    </ThemedScrollView>
  )
}
