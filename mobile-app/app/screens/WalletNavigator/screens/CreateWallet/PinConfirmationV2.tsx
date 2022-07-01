import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { View } from '@components/index'
import { ThemedActivityIndicator, ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '@screens/WalletNavigator/WalletNavigator'
import { CREATE_STEPS, RESTORE_STEPS, CreateWalletStepIndicatorV2 } from '@components/CreateWalletStepIndicatorV2'
import { PinTextInputV2 } from '@components/PinTextInputV2'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { WalletPersistenceDataI } from '@shared-contexts/WalletPersistenceContext'
import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MnemonicEncrypted } from '@api/wallet'
import { MnemonicStorage } from '@api/wallet/mnemonic_storage'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>

export function PinConfirmationV2 ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const logger = useLogger()
  const [isComplete, setIsComplete] = useState<boolean>(false) // To complete the last stepper node when pin is verified.
  const { network } = useNetworkContext()
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
      setIsComplete(true)
    }

    const copy = { words, network, pin, isWalletRestored: type === 'restore' }

    setSpinnerMessage(translate('screens/PinConfirmation', 'It may take a few seconds to securely encrypt your wallet...'))
    setTimeout(() => {
      MnemonicEncrypted.toData(copy.words, copy.network, copy.pin)
        .then(async encrypted => {
          await MnemonicStorage.set(words, pin)
          navigateToNextPage({
            data: encrypted,
            isWalletRestored: type === 'restore'
          })
        })
        .catch(logger.error)
    }, 50) // allow UI render the spinner before async task

    setSpinnerMessage(translate('screens/PinConfirmation', 'It may take a few seconds to secure and encrypt your wallet'))
  }

  function navigateToNextPage (params: {data: WalletPersistenceDataI<EncryptedProviderData>, isWalletRestored: boolean}): void {
    navigation.navigate({
      name: 'WalletCreateRestoreSuccess', params, merge: true
    })
  }

  return (
    <ThemedScrollViewV2
      style={tailwind('w-full flex-1 flex-col')}
      contentContainerStyle={tailwind('pt-12')}
    >
      <CreateWalletStepIndicatorV2
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-0.5 px-14')}
        isComplete={isComplete}
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
