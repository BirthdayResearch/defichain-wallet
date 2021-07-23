import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import tailwind from 'tailwind-rn'
import { Mnemonic } from '../../../api/wallet/mnemonic'
import { Text, View } from '../../../components'
import { CreateWalletStepIndicator } from '../../../components/CreateWalletStepIndicator'
import { PinInput } from '../../../components/PinInput'
import { PrimaryButton } from '../../../components/PrimaryButton'
import { useWalletManagementContext } from '../../../contexts/WalletManagementContext'
import { translate } from '../../../translations'
import { WalletParamList } from '../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinConfirmation'>
const MAX_ALLOWED_ATTEMPT = 3

export function PinConfirmation ({ route }: Props): JSX.Element {
  const navigation = useNavigation()
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

    setWallet(Mnemonic.createWalletData(words))
      .catch(e => console.log(e))
  }

  return (
    <ScrollView style={tailwind('w-full flex-1 flex-col bg-white')}>
      <PinInput
        length={pin.length as any}
        onChange={verifyPin}
      />
      {
        (invalid) ? (
          <Text style={tailwind('text-center text-red-500')}>
            {translate('screens/PinConfirmation', 'Wrong passcode entered')}
          </Text>
        ) : null
      }
    </ScrollView>
  )
}
