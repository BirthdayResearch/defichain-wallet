import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '../../../tailwind'
import { Text, View } from '../../../components'
import { PinInput } from '../../../components/PinInput'
import { translate } from '../../../translations'

interface UnlockWalletProps {
  pinLength: 4 | 6
  onPinInput: (pin: string) => void
  onCancel: () => void
  attemptsRemaining?: number
}

/**
 * This meant to be a full page UI (simple component) and NOT accessed via navigation
 * this component render side by side with AppNavigator
 */
export function UnlockWallet (props: UnlockWalletProps): JSX.Element {
  const { pinLength, onPinInput, attemptsRemaining, onCancel } = props
  const [passcode, setPasscode] = useState('')

  return (
    <View style={tailwind('w-full h-full flex-col')}>
      <TouchableOpacity style={tailwind('bg-white p-4')} onPress={onCancel}>
        <Text
          style={tailwind('font-bold text-primary')}
        >{translate('components/UnlockWallet', 'CANCEL')}
        </Text>
      </TouchableOpacity>
      <View style={tailwind('bg-white w-full flex-1 flex-col justify-center border-t border-gray-200')}>
        <Text style={tailwind('text-center text-lg font-bold')}>{translate('screens/UnlockWallet', 'Enter passcode')}</Text>
        <Text style={tailwind('pt-2 pb-4 text-center text-gray-500')}>{translate('screens/UnlockWallet', 'For transaction signing purpose')}</Text>
        <PinInput
          value={passcode}
          length={pinLength}
          onChange={pin => {
            setPasscode(pin)
            setTimeout(() => onPinInput(pin), 100)
          }}
        />
        {
          (attemptsRemaining !== undefined) ? (
            <Text style={tailwind('text-center text-red-500 font-bold')}>
              {translate('screens/PinConfirmation', 'Wrong passcode. %{attemptsRemaining} tries remaining', { attemptsRemaining })}
            </Text>
          ) : null
        }
      </View>
    </View>
  )
}
