import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import tailwind from 'tailwind-rn'
import { MnemonicEncrypted } from '../../../api/wallet/provider/mnemonic_encrypted'
import { Text } from '../../../components'
import { PinInput } from '../../../components/PinInput'
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { useWalletManagementContext } from '../../../contexts/WalletManagementContext'
import { translate } from '../../../translations'
import { WalletParamList } from '../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>

export function PinConfirmation ({ route }: Props): JSX.Element {
  const { network } = useNetworkContext()
  const { pin, words } = route.params
  const { setWallet } = useWalletManagementContext()
  const [invalid, setInvalid] = useState<boolean>(false)

  if (![4, 6].includes(pin.length)) throw new Error('Unexpected pin length')

  // inherit from MnemonicVerify screen
  // TODO(@ivan-zynesis): encrypt seed
  function verifyPin (input: string): void {
    if (input.length !== pin.length) return
    if (input !== pin) {
      setInvalid(true)
      return
    }
    MnemonicEncrypted.toData(words, network, pin)
      .then(async encrypted => {
        await setWallet(encrypted)
      })
      .catch(e => console.log(e))
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
        (invalid) ? (
          <Text style={tailwind('text-center text-red-500 font-bold')}>
            {translate('screens/PinConfirmation', 'Wrong passcode entered')}
          </Text>
        ) : null
      }
    </ScrollView>
  )
}
