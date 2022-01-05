import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useState } from 'react'
import { View } from '@components/index'
import { PinTextInput } from '@components/PinTextInput'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsParamList } from '../SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'ChangePinScreen'>

export function ChangePinScreen ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<SettingsParamList>>()
  const {
    pinLength,
    words
  } = route.params
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

  const goToPasscodeFaq = (): void => {
    navigation.navigate('PasscodeFaq')
  }

  return (
    <ThemedScrollView
      dark={tailwind('bg-gray-900')}
      light={tailwind('bg-white')}
      style={tailwind('w-full flex-1 flex-col')}
      testID='screen_create_pin'
    >
      <View style={tailwind('px-6 py-4 mb-8 mt-8')}>
        <ThemedText
          style={tailwind('text-center font-semibold')}
        >
          {translate('screens/ChangePinScreen', 'Create new passcode for your wallet')}
        </ThemedText>
      </View>

      <PinTextInput
        cellCount={6}
        onChange={setNewPin}
        testID='pin_input'
        value={newPin}
      />

      <View style={tailwind('p-4 flex-row mt-2 justify-center items-center')}>
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
      <ThemedTouchableOpacity
        onPress={goToPasscodeFaq}
        light={tailwind('border-0')}
        dark={tailwind('border-0')}
        style={tailwind('p-4 flex-row mt-2 mb-8 justify-center items-center')}
        testID='passcode_faq_link'
      >
        <ThemedText
          style={tailwind('text-center text-sm font-semibold')}
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
        >
          {translate('screens/PinCreation', 'Learn more about passcode')}
        </ThemedText>
      </ThemedTouchableOpacity>
    </ThemedScrollView>
  )
}
