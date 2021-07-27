import React from 'react'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../components'
import { PinInput } from '../../../components/PinInput'
import { translate } from '../../../translations'

interface UnlockWalletProps {
  pinLength: 4 | 6
  onPinInput: (pin: string) => void
  errorCount: number
}

/**
 * This meant to be a full page UI (simple component) and NOT accessed via navigation
 * this component render side by side with AppNavigator
 */
export function UnlockWallet (props: UnlockWalletProps): JSX.Element {
  const { pinLength, onPinInput, errorCount = 0 } = props

  return (
    <View style={tailwind('bg-white w-full h-full flex-col justify-center')}>
      <Text style={tailwind('text-center text-lg font-bold')}>{translate('screens/UnlockWallet', 'Enter passcode')}</Text>
      <Text style={tailwind('pt-2 pb-4 text-center text-gray-500')}>{translate('screens/UnlockWallet', 'For transaction signing purpose')}</Text>
      <PinInput
        length={pinLength}
        onChange={pin => {
          setTimeout(() => onPinInput(pin), 100)
        }}
      />
      {
        (errorCount !== 0) ? (
          <Text style={tailwind('text-center text-red-500 font-bold')}>
            {translate('screens/PinConfirmation', 'Wrong passcode. {{errorCount}} tries remaining', { errorCount })}
          </Text>
        ) : null
      }
    </View>
  )
}
