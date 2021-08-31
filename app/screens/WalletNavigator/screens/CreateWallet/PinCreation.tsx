import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { View } from '../../../../components'
import {
  CREATE_STEPS,
  CreateWalletStepIndicator,
  RESTORE_STEPS
} from '../../../../components/CreateWalletStepIndicator'
import { PinTextInput } from '../../../../components/PinTextInput'
import { ThemedIcon, ThemedScrollView, ThemedText } from '../../../../components/themed'
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
    <ThemedScrollView
      dark={tailwind('bg-blue-900')}
      light={tailwind('bg-white')}
      style={tailwind('w-full flex-1 flex-col')}
      testID='screen_create_pin'
    >
      <CreateWalletStepIndicator
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />

      <View style={tailwind('px-6 py-4 mb-12')}>
        <ThemedText
          style={tailwind('text-center font-semibold')}
        >
          {translate('screens/PinCreation', `Well done! Your wallet is ${type === 'create' ? 'created' : 'restored'}. Keep your wallet private and secure by creating a passcode for it.`)}
        </ThemedText>
      </View>

      <PinTextInput
        cellCount={6}
        onChange={setNewPin}
        testID='pin_input'
        value={newPin}
      />

      <View style={tailwind('p-4 flex-row mt-2 mb-8 justify-center items-center')}>
        <ThemedIcon
          iconType='MaterialIcons'
          name='lock-outline'
          size={18}
        />

        <ThemedText
          style={tailwind('text-center text-sm font-semibold ml-2')}
        >
          {translate('screens/PinCreation', 'Keep your passcode private')}
        </ThemedText>
      </View>
    </ThemedScrollView>
  )
}
