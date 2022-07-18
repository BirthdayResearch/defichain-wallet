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

export function PinCreation ({ route }: Props): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const {
    pinLength,
    words,
    type
  } = route.params
  const [newPin, setNewPin] = useState('')
  const isCreateWallet = type === 'create'
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
      style={tailwind('flex-1')}
      contentContainerStyle={tailwind('pt-12 px-5 pb-16')}
      testID='screen_create_pin'
    >
      <View style={tailwind('px-5 mb-12')}>
        <CreateWalletStepIndicatorV2
          current={isCreateWallet ? 3 : 2}
          steps={isCreateWallet ? CREATE_STEPS : RESTORE_STEPS}
          style={tailwind(isCreateWallet ? 'px-4' : 'px-16')}
        />
        <ThemedTextV2
          style={tailwind('text-center mt-7 text-center font-normal-v2')}
        >
          {translate('screens/PinCreation', 'Add an additional layer of security by setting a passcode.')}
        </ThemedTextV2>
        <LearnMoreCTA onPress={goToPasscodeFaq} testId='passcode_faq_link' />
      </View>

      <View style={tailwind('mx-16')}>
        <PinTextInputV2
          cellCount={6}
          onChange={setNewPin}
          testID='pin_input'
          value={newPin}
        />
      </View>

      <View style={tailwind('mt-5')}>
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
