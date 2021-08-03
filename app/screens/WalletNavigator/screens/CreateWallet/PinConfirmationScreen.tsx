import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ActivityIndicator, ScrollView } from 'react-native'
import tailwind from 'tailwind-rn'
import { MnemonicEncrypted } from '../../../../api/wallet/provider/mnemonic_encrypted'
import { Text, View } from '../../../../components'
import { PinInput } from '../../../../components/PinInput'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>

export function PinConfirmation ({ route }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const { pin, words } = route.params
  const { setWallet } = useWalletPersistenceContext()

  const [invalid, setInvalid] = useState<boolean>(false)
  const [spinnerMessage, setSpinnerMessage] = useState<string>()

  function verifyPin (input: string): void {
    if (input.length !== pin.length) return
    if (input !== pin) {
      setInvalid(true)
      return
    }

    const copy = { words, network, pin }
    setSpinnerMessage(translate('screens/PinConfirmation', 'Encrypting wallet...'))
    setTimeout(() => {
      MnemonicEncrypted.toData(copy.words, copy.network, copy.pin)
        .then(async encrypted => {
          await setWallet(encrypted)
        })
        .catch(e => console.log(e))
    }, 50) // allow UI render the spinner before async task
  }

  return (
    <ScrollView contentContainerStyle={tailwind('w-full flex-1 flex-col bg-white justify-center')}>
      <Text style={tailwind('text-center text-lg font-bold')}>{translate('screens/PinConfirmation', 'Verify your passcode')}</Text>
      <Text style={tailwind('pt-2 pb-4 text-center text-gray-500')}>{translate('screens/PinConfirmation', 'Enter your passcode again to verify')}</Text>
      <PinInput
        length={pin.length as any}
        onChange={verifyPin}
      />
      {
        (spinnerMessage !== undefined) ? (
          <View style={tailwind('flex-row justify-center p-2')}>
            <ActivityIndicator />
            <Text style={tailwind('ml-2')}>{spinnerMessage}</Text>
          </View>
        ) : null
      }
      {
        (invalid) ? (
          <Text style={tailwind('text-center text-red-500 font-bold')}>
            {translate('screens/PinConfirmation', 'Wrong passcode entered')}
          </Text>
        ) : null
      }
    </ScrollView>
  )
}
