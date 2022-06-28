import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useState } from 'react'
import { View } from '@components/index'
import { CREATE_STEPS, CreateWalletStepIndicator, RESTORE_STEPS } from '@components/CreateWalletStepIndicator.v2'
import { PinTextInputV2 } from '@components/PinTextInputV2'
import { ThemedScrollViewV2, ThemedTextV2, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'PinCreation'>

export function PinCreationV2 ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const {
    pinLength,
    words,
    type
  } = route.params
  const [newPin, setNewPin] = useState('')
  const goToPasscodeFaq = (): void => {
    navigation.navigate('PasscodeFaq')
  }

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
    <ThemedScrollViewV2
      style={tailwind('w-full flex-1 flex-col')}
      contentContainerStyle={tailwind('items-center')}
      testID='screen_create_pin'
    >
      <CreateWalletStepIndicator
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />

      <View style={tailwind('p-8 mb-12')}>
        <ThemedTextV2
          style={tailwind('text-center font-normal-v2')}
        >
          {translate('screens/PinCreation', 'Add an additional layer of security by setting a passcode.')}
        </ThemedTextV2>
        <ThemedTouchableOpacity
          onPress={goToPasscodeFaq}
          light={tailwind('border-0')}
          dark={tailwind('border-0')}
          style={tailwind(' pt-2')}
          testID='passcode_faq_link'
        >
          <ThemedTextV2
            style={tailwind('text-center text-sm font-semibold-v2')}
          >
            {translate('screens/PinCreation', 'Learn more')}
          </ThemedTextV2>
        </ThemedTouchableOpacity>
      </View>

      <PinTextInputV2
        cellCount={6}
        onChange={setNewPin}
        testID='pin_input'
        value={newPin}
      />

      <View style={tailwind('mt-1.5')}>
        <ThemedTextV2
          style={tailwind('text-sm font-normal-v2 text-center')}
        >
          {translate('screens/PinCreation', 'Create your passcode')}
        </ThemedTextV2>
      </View>
    </ThemedScrollViewV2>
  )
}
