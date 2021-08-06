import { validateMnemonicSentence } from '@defichain/jellyfish-wallet-mnemonic'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { createRef, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, TextInput } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Text, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { CreateWalletStepIndicator, RESTORE_STEPS } from '../../../../components/CreateWalletStepIndicator'
import { SectionTitle } from '../../../../components/SectionTitle'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import LoadingScreen from '../../../LoadingNavigator/LoadingScreen'
import { WalletParamList } from '../../WalletNavigator'

export function RestoreMnemonicWallet (): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const { control, formState: { isValid }, getValues } = useForm({ mode: 'onChange' })
  const [recoveryWords] = useState<number[]>(Array.from(Array(24), (v, i) => i + 1))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputRefMap, setInputRefMap] = useState<Array<React.RefObject<TextInput>>>([])

  useEffect(() => {
    recoveryWords.forEach((r) => {
      inputRefMap[r] = createRef<TextInput>()
      setInputRefMap(inputRefMap)
    })
  }, [])

  if (inputRefMap.length < 24) {
    return <LoadingScreen />
  }

  async function onRestore (): Promise<void> {
    setIsSubmitting(true)
    const words = Object.values(getValues())
    if (isValid && validateMnemonicSentence(words)) {
      setIsSubmitting(false)
      navigation.navigate('PinCreation', {
        words,
        pinLength: 6,
        type: 'restore'
      })
    } else {
      setIsSubmitting(false)
      Alert.alert(
        translate('screens/RestoreWallet', 'Error'),
        translate('screens/RestoreWallet', 'The recovery words you have entered are invalid. Please double check and try again.'),
        [
          { text: 'OK' }
        ]
      )
    }
  }

  return (
    <KeyboardAwareScrollView style={tailwind('bg-white')}>
      <CreateWalletStepIndicator
        current={1}
        steps={RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />
      <View style={tailwind('justify-center p-4')}>
        <Text style={tailwind('font-medium text-sm text-gray-500 text-center')}>
          {translate('screens/RestoreWallet', 'Please provide your 24 recovery words to regain access to your wallet.')}
        </Text>
      </View>
      <View style={tailwind('bg-gray-100')}>
        <SectionTitle
          text={translate('screens/RestoreWallet', 'ENTER THE CORRECT WORD')}
          testID='recover_title'
        />
      </View>
      {
        recoveryWords.map((order) => (
          <Controller
            key={order}
            control={control}
            rules={{
              required: true,
              pattern: /^[a-z]+$/
            }}
            render={({ field: { value, onBlur, onChange }, fieldState: { invalid, isTouched } }) => (
              <View style={tailwind('flex-row w-full bg-white border-b border-gray-200')}>
                <Text style={tailwind('p-4 font-semibold w-20 pr-0')}>{`#${order}`}</Text>
                <TextInput
                  ref={inputRefMap[order]}
                  testID={`recover_word_${order}`}
                  placeholderTextColor={`${invalid && isTouched ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 0, 0.4)'}`}
                  style={tailwind(`flex-grow p-4 pl-0 ${invalid && isTouched ? 'text-error' : 'text-black'}`)}
                  autoCapitalize='none'
                  autoCompleteType='off'
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType='default'
                  placeholder={translate('screens/SendScreen', `Enter word #${order}`)}
                  returnKeyType={order === 24 ? 'done' : 'next'}
                  blurOnSubmit={false}
                  onSubmitEditing={async () => {
                    if (inputRefMap[order + 1] !== undefined) {
                      inputRefMap[order + 1].current?.focus()
                    } else {
                      await onRestore()
                    }
                  }}
                />
              </View>
            )}
            name={`recover_word_${order}`}
            defaultValue=''
          />
        ))
      }
      <Button
        title='recover_wallet' onPress={onRestore} testID='recover_wallet_button'
        disabled={!isValid || isSubmitting}
        label={translate('screens/RestoreWallet', 'RESTORE WALLET')}
      />
    </KeyboardAwareScrollView>
  )
}
