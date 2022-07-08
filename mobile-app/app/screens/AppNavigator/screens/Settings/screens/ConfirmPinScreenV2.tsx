import { StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { MnemonicEncrypted } from '@api/wallet'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { View } from '@components/index'
import { PinTextInputV2 } from '@components/PinTextInputV2'
import { ThemedActivityIndicatorV2, ThemedScrollViewV2, ThemedTextV2, ThemedIcon } from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsParamList } from '../SettingsNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

type Props = StackScreenProps<SettingsParamList, 'ConfirmPinScreen'>

export function ConfirmPinScreenV2 ({ route }: Props): JSX.Element {
  const logger = useLogger()
  const navigation = useNavigation()
  const { network } = useNetworkContext()
  const { setWallet } = useWalletPersistenceContext()
  const {
    pin,
    words
  } = route.params

  const [newPin, setNewPin] = useState('')
  const [invalid, setInvalid] = useState<boolean>(false)
  const [spinnerMessage, setSpinnerMessage] = useState<string>()
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

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
    setSpinnerMessage(translate('screens/PinConfirmation', 'It may take a few seconds to update your passcode.'))
    setTimeout(() => {
      MnemonicEncrypted.toData(copy.words, copy.network, copy.pin)
        .then(async encrypted => {
          await MnemonicStorage.set(words, pin)
          await passcodeChangeSuccess(encrypted)
        })
        .catch(logger.error)
    }, 50) // allow UI render the spinner before async task
  }

   function passcodeChangeSuccess (encrypted: any): void {
    setTimeout(() => {
       setWallet(encrypted)
         .then(() => navigation.dispatch(StackActions.popToTop()))
    }, 500) // Show passcode change success message
    setSpinnerMessage(translate('screens/PinConfirmation', 'Passcode updated!'))
    setIsSuccess(true)
  }
  return (
    <ThemedScrollViewV2
      style={tailwind('w-full flex-1 flex-col')}
    >
      <View style={[tailwind('px-6 mt-12'), { marginBottom: spinnerMessage === undefined ? 76 : 0 }]}>
        <ThemedTextV2
          style={tailwind('text-center font-normal-v2')}
        >
          {translate('screens/PinConfirmation', 'Keep the passcode for your wallet confidential.')}
        </ThemedTextV2>
        {spinnerMessage !== undefined && !isSuccess && <ThemedActivityIndicatorV2 style={{ marginVertical: 22 }} />}
        {isSuccess && <SuccessIndicator />}
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
      <View style={tailwind('mt-5 px-12')}>
        {
          (spinnerMessage !== undefined) &&
            (
              <View style={tailwind('items-center px-4')}>
                <ThemedTextV2
                  style={tailwind('font-normal-v2 text-sm text-center')}
                  light={tailwind('text-mono-light-v2-700')}
                  dark={tailwind('text-mono-dark-v2-700')}
                >
                  {spinnerMessage}
                </ThemedTextV2>
              </View>
            )
        }

        {
          (spinnerMessage === undefined && !invalid) && (
            <ThemedTextV2
              style={tailwind('font-normal-v2 text-sm text-center')}
              light={tailwind('text-mono-light-v2-700')}
              dark={tailwind('text-mono-dark-v2-700')}
            >
              {translate('screens/PinConfirmation', 'Enter passcode for verification')}
            </ThemedTextV2>
          )
        }

        {
          invalid && (
            <ThemedTextV2
              dark={tailwind('text-red-v2')}
              light={tailwind('text-red-v2')}
              style={tailwind('text-center font-normal-v2 text-sm')}
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

function SuccessIndicator (): JSX.Element {
  return (
    <View style={[tailwind('flex flex-col items-center'), { marginVertical: 22 }]}>
      <View
        style={tailwind('h-9 w-9 rounded-full flex justify-center items-center border bg-green-v2 border-green-v2')}
      >
        <ThemedIcon
          size={32}
          name='check'
          iconType='Feather'
          dark={tailwind('text-mono-dark-v2-00')}
          light={tailwind('text-mono-light-v2-00')}
        />
      </View>
    </View>
  )
}
