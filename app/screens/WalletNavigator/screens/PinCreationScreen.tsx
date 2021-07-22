import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import tailwind from 'tailwind-rn'
import { Mnemonic } from '../../../api/wallet/mnemonic'
import { Text, View } from '../../../components'
import { CreateWalletStepIndicator } from '../../../components/CreateWalletStepIndicator'
import { PinInput } from '../../../components/PinInput'
import { PrimaryButton } from '../../../components/PrimaryButton'
import { useWalletManagementContext } from '../../../contexts/WalletManagementContext'
import { translate } from '../../../translations'
import { WalletParamList } from '../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinCreation'>
type STEP = 'CREATE' | 'VERIFY'

export function PinCreationScreen ({ navigation, route }: Props): JSX.Element {
  const { pinLength, words } = route.params
  const [step, setStep] = useState<STEP>('CREATE')
  const [newPin, setNewPin] = useState('')
  const [verifyPin, setVerifyPin] = useState('')
  const { setWallet } = useWalletManagementContext()

  // inherit from MnemonicVerify screen
  // TODO(@ivan-zynesis): encrypt seed
  function onPinVerified (): void {
    setWallet(Mnemonic.createWalletData(words))
      .catch(e => console.log(e))
  }

  return (
    <View style={tailwind('w-full flex-1 flex-col bg-white')}>
      {
        step === 'CREATE' ? (
          <CreatePin
            pinLength={pinLength}
            onChange={(val: string) => { setNewPin(val) }}
            onComplete={() => setStep('VERIFY')}
            value={newPin}
          />
        ) : null
      }
      {
        step === 'VERIFY' ? (
          <VerifyPin
            pinLength={pinLength}
            value={verifyPin}
            error={verifyPin.length === 6 && verifyPin !== newPin}
            onChange={(val: string) => {
              setVerifyPin(val)
              if (newPin === val) onPinVerified()
            }}
          />
        ) : null
      }
    </View>
  )
}

function CreatePin (props: { value: string, pinLength: 4 | 6, onChange: (pin: string) => void, onComplete: () => void }): JSX.Element {
  return (
    <>
      <CreateWalletStepIndicator
        current={3}
        steps={[
          translate('components/CreateWalletIndicator', 'display'),
          translate('components/CreateWalletIndicator', 'verify'),
          translate('components/CreateWalletIndicator', 'secure')
        ]}
        style={tailwind('p-4')}
      />
      <View style={tailwind('p-4')}>
        <Text style={tailwind('text-center text-lg font-bold')}>{translate('screens/PinCreation', 'Secure your wallet')}</Text>
      </View>
      <View style={tailwind('p-4')}>
        <Text style={tailwind('text-center text-gray-500')}>{translate('screens/PinCreation', 'Well done! You answered correctly. Now let\'s make your wallet safe by creating a passcode. Don\'t share your passcode to anyone.')}</Text>
      </View>
      <View style={tailwind('p-4 flex-row mt-4 justify-center items-center')}>
        <MaterialIcons name='lock' />
        <Text style={tailwind('text-center font-bold')}>{translate('screens/PinCreation', 'Create a passcode for your wallet')}</Text>
      </View>
      <PinInput
        length={props.pinLength}
        onChange={props.onChange}
      />
      <PrimaryButton onPress={props.onComplete} title='create-pin' disabled={props.value.length !== props.pinLength}>
        <Text style={tailwind('text-white font-bold')}>{translate('screens/PinCreation', 'CREATE PASSCODE')}</Text>
      </PrimaryButton>
    </>
  )
}

function VerifyPin (props: { value: string, pinLength: 4 | 6, onChange: (pin: string) => void, error: boolean }): JSX.Element {
  return (
    <>
      <PinInput
        length={props.pinLength}
        onChange={props.onChange}
      />
      {
        (props.error) ? (
          <Text style={tailwind('text-center text-red-500')}>{translate('screens/PinCreation', 'Wrong passcode entered')}</Text>
        ) : null
      }
    </>
  )
}
