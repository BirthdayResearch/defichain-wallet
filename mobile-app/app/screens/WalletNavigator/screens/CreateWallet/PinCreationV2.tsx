import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useState } from 'react'
import { View } from '@components/index'
import { PinTextInputV2 } from '@components/PinTextInputV2'
import { ThemedScrollViewV2, ThemedTextV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '../../WalletNavigator'
import { CREATE_STEPS, RESTORE_STEPS, CreateWalletStepIndicatorV2 } from '@components/CreateWalletStepIndicatorV2'
import { LearnMoreCTA } from '../components/LearnModeCTA'

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
      contentContainerStyle={tailwind('items-center pt-12')}
      testID='screen_create_pin'
    >
      <CreateWalletStepIndicatorV2
        current={type === 'create' ? 3 : 2}
        steps={type === 'create' ? CREATE_STEPS : RESTORE_STEPS}
        style={tailwind('py-0.5 px-14')}
      />

      <View style={tailwind('px-10')}>
        <ThemedTextV2
          style={tailwind('text-center font-normal-v2 mt-7')}
        >
          {translate('screens/PinCreation', 'Add an additional layer of security by setting a passcode.')}
        </ThemedTextV2>
        <View style={{ marginBottom: 52 }}>
          <LearnMoreCTA onPress={goToPasscodeFaq} testId='passcode_faq_link' />
        </View>
      </View>

      <PinTextInputV2
        cellCount={6}
        onChange={setNewPin}
        testID='pin_input'
        value={newPin}
      />

      <View style={tailwind('mt-1')}>
        <ThemedTextV2
          style={tailwind('text-sm font-normal-v2 text-center')}
          light={tailwind('text-mono-light-v2-700')}
          dark={tailwind('text-mono-dark-v2-700')}
        >
          {translate('screens/PinCreation', 'Create your passcode')}
        </ThemedTextV2>
      </View>
    </ThemedScrollViewV2>
  )
}
