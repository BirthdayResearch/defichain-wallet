import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Text, View } from '../../../../components'
import {
  CREATE_STEPS,
  CreateWalletStepIndicator,
  RESTORE_STEPS
} from '../../../../components/CreateWalletStepIndicator'
import { PinTextInput } from '../../../../components/PinTextInput'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinCreation'>

export function PinCreation ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const { pinLength, words, type } = route.params
  const [newPin, setNewPin] = useState('')

  useEffect(() => {
    if (newPin.length !== pinLength) {
      return
    }

    setNewPin('')
    navigation.navigate({
      name: 'PinConfirmation', params: { words, pin: newPin, type }, merge: true
    })
  }, [newPin])

  return (
    <ScrollView
      testID='screen_create_pin'
      style={tailwind('w-full flex-1 flex-col bg-white')}
    >
      <CreateWalletStepIndicator
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />
      <View style={tailwind('px-6 py-4 mb-12')}>
        <Text
          style={tailwind('text-center font-semibold')}
        >{translate('screens/PinCreation', `Well done! Your wallet is ${type === 'create' ? 'created' : 'restored'}. Keep your wallet private and secure by creating a passcode for it.`)}
        </Text>
      </View>
      <PinTextInput cellCount={6} testID='pin_input' value={newPin} onChange={setNewPin} />
      <View style={tailwind('p-4 flex-row mt-2 mb-8 justify-center items-center')}>
        <MaterialIcons name='lock-outline' size={18} />
        <Text
          style={tailwind('text-center text-sm font-semibold ml-2')}
        >{translate('screens/PinCreation', 'Keep your passcode private')}
        </Text>
      </View>
    </ScrollView>
  )
}
