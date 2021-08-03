import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { CreateWalletStepIndicator } from '../../../../components/CreateWalletStepIndicator'
import { PinInput } from '../../../../components/PinInput'
import { Button } from '../../../../components/Button'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinCreation'>

export function PinCreationScreen ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const { pinLength, words } = route.params
  const [newPin, setNewPin] = useState('')

  return (
    <ScrollView style={tailwind('w-full flex-1 flex-col bg-white')}>
      <CreateWalletStepIndicator
        current={3}
        steps={[
          translate('components/CreateWalletIndicator', 'recovery'),
          translate('components/CreateWalletIndicator', 'verify'),
          translate('components/CreateWalletIndicator', 'secure')
        ]}
        style={tailwind('p-4')}
      />
      <View style={tailwind('p-4')}>
        <Text style={tailwind('text-center text-gray-500')}>{translate('screens/PinCreation', 'Well done! You answered correctly. Now let\'s make your wallet safe by creating a passcode. Don\'t share your passcode to anyone.')}</Text>
      </View>
      <View style={tailwind('p-4 flex-row mt-4 justify-center items-center')}>
        <MaterialIcons name='lock' />
        <Text style={tailwind('text-center font-bold ml-2')}>{translate('screens/PinCreation', 'Create a passcode for your wallet')}</Text>
      </View>
      <PinInput
        length={pinLength}
        onChange={val => setNewPin(val)}
      />
      <Button
        label={translate('screens/PinCreation', 'CREATE PASSCODE')}
        title='create-pin'
        disabled={newPin.length !== pinLength}
        onPress={() => {
          navigation.navigate('PinConfirmation', { words, pin: newPin })
        }}
      />
    </ScrollView>
  )
}
