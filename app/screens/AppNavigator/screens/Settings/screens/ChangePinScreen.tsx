import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Text, View } from '../../../../../components'
import { PinTextInput } from '../../../../../components/PinTextInput'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { SettingsParamList } from '../SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'ChangePinScreen'>

export function ChangePinScreen ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const { pinLength, words } = route.params
  const [newPin, setNewPin] = useState('')

  useEffect(() => {
    if (newPin.length !== pinLength) {
      return
    }

    setNewPin('')
    navigation.navigate({
      name: 'ConfirmPinScreen', params: { words, pin: newPin }, merge: true
    })
  }, [newPin])

  return (
    <ScrollView
      testID='screen_create_pin'
      style={tailwind('w-full flex-1 flex-col bg-white')}
    >
      <View style={tailwind('px-6 py-4 mb-8 mt-8')}>
        <Text
          style={tailwind('text-center font-semibold')}
        >{translate('screens/ChangePinScreen', 'Create new passcode for your wallet')}
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
