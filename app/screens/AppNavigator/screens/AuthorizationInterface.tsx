import React from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { tailwind } from '../../../tailwind'
import { Text, View } from '../../../components'
import { PinInput } from '../../../components/PinInput'
import { translate } from '../../../translations'

interface UnlockWalletProps {
  pinLength: 4 | 6
  onPinInput: (pin: string) => void
  onCancel: () => void
  attemptsRemaining?: number

  // very customized props
  isPrompting: boolean // used as a switch, enable/disable the pin component, thus controlling the lifecycle
  spinnerMessage?: string // indicate main promise (sign + broadcast) still ongoing
}

/**
 * FULL page sized (only) stateless UI component
 * not navigate-able
 */
export function AuthorizationInterface (props: UnlockWalletProps): JSX.Element {
  const { pinLength, onPinInput, attemptsRemaining, onCancel, isPrompting, spinnerMessage } = props

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
        <Loading message={spinnerMessage} />
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
  if (!isPrompting) {
    return null
  }

  return (
    <PinInput length={pinLength} onChange={onPinInput} />
  )
}

function Loading ({ message }: { message?: string }): JSX.Element | null {
  if (message === undefined) return null
  return (
    <View style={tailwind('flex-row justify-center p-2')}>
      <ActivityIndicator style={tailwind('text-primary')} />
      <Text style={tailwind('ml-2')}>{message}</Text>
    </View>
  )
}
