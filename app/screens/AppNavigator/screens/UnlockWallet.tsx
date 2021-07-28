import React from 'react'
import { TouchableOpacity } from 'react-native'
import { tailwind } from '../../../tailwind'
import { Text, View } from '../../../components'
import { PinInput } from '../../../components/PinInput'
import { translate } from '../../../translations'

interface UnlockWalletProps {
  isPrompting: boolean
  pinLength: 4 | 6
  onPinInput: (pin: string) => void
  onCancel: () => void
  attemptsRemaining?: number
}

/**
 * FULL page sized (only) stateless UI component
 * not navigate-able
 */
export function UnlockWalletInterface (props: UnlockWalletProps): JSX.Element {
  const { pinLength, onPinInput, attemptsRemaining, onCancel, isPrompting } = props

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
        {/* TODO: switch authorization method here when biometric supported */}
        <PassphraseInput isPrompting={isPrompting} pinLength={pinLength} onPinInput={onPinInput} />
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

function PassphraseInput ({ isPrompting, pinLength, onPinInput }: {
  isPrompting: boolean
  pinLength: 4 | 6
  onPinInput: (pin: string) => void
}): JSX.Element | null {
  if (!isPrompting) return <View style={tailwind('h-10')} /> // minimize visible flicker

  return (
    <PinInput length={pinLength} onChange={onPinInput} />
  )
}
