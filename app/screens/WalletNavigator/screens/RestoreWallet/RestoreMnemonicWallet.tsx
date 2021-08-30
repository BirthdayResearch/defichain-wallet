import { validateMnemonicSentence } from '@defichain/jellyfish-wallet-mnemonic'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as React from 'react'
import { createRef, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { TextInput } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { CreateWalletStepIndicator, RESTORE_STEPS } from '../../../../components/CreateWalletStepIndicator'
import { SectionTitle } from '../../../../components/SectionTitle'
import { ThemedText, ThemedView } from '../../../../components/themed'
import { WalletAlert } from '../../../../components/WalletAlert'
import { useThemeContext } from '../../../../contexts/ThemeProvider'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

export function RestoreMnemonicWallet (): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const { control, formState: { isValid, isDirty }, getValues } = useForm({ mode: 'onChange' })
  const [recoveryWords] = useState<number[]>(Array.from(Array(24), (v, i) => i + 1))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputRefMap, setInputRefMap] = useState<Array<React.RefObject<TextInput>>>([])

  useEffect(() => {
    recoveryWords.forEach((r) => {
      inputRefMap[r] = createRef<TextInput>()
      setInputRefMap(inputRefMap)
    })
  }, [])

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      if (!isDirty) {
        // If we don't have unsaved changes, then we don't need to do anything
        return
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault()

      // Prompt the user before leaving the screen
      WalletAlert({
        title: translate('screens/RestoreWallet', 'Discard changes?'),
        message: translate('screens/RestoreWallet', 'You have unsaved changes. Are you sure to discard them and leave the screen?'),
        buttons: [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
            }
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action)
          }
        ]
      })
    })
    return () => {
      navigation.removeListener('beforeRemove', () => {
      })
    }
  }, [navigation, isDirty])

  if (inputRefMap.length < 24) {
    return <></>
  }

  async function onRestore (): Promise<void> {
    setIsSubmitting(true)
    const words = Object.values(getValues())
    if (isValid && validateMnemonicSentence(words)) {
      setIsSubmitting(false)
      navigation.navigate({
        name: 'PinCreation',
        params: {
          words,
          pinLength: 6,
          type: 'restore'
        },
        merge: true
      })
    } else {
      setIsSubmitting(false)
      WalletAlert({
        title: translate('screens/RestoreWallet', 'Error'),
        message: translate('screens/RestoreWallet', 'The recovery words you have entered are invalid. Please double check and try again.'),
        buttons: [
          { text: 'OK' }
        ]
      })
    }
  }

  const { isLight } = useThemeContext()
  const light = 'text-gray-700 bg-white'
  const dark = 'text-white bg-gray-800'
  return (
    <KeyboardAwareScrollView style={tailwind(`${isLight ? 'bg-white' : 'bg-gray-900'}`)}>
      <CreateWalletStepIndicator
        current={1}
        steps={RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />
      <View style={tailwind('justify-center p-4')}>
        <ThemedText
          light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}
          style={tailwind('font-medium text-sm text-center')}
        >
          {translate('screens/RestoreWallet', 'Please provide your 24 recovery words to regain access to your wallet.')}
        </ThemedText>
      </View>
      <ThemedView>
        <SectionTitle
          text={translate('screens/RestoreWallet', 'ENTER THE CORRECT WORD')}
          testID='recover_title'
        />
      </ThemedView>
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
              <ThemedView
                light={tailwind('bg-white border-b border-gray-200')}
                dark={tailwind('bg-gray-800 border-b border-gray-700')} style={tailwind('flex-row w-full')}
              >
                <ThemedText style={tailwind('p-4 font-semibold w-20 pr-0')}>{`#${order}`}</ThemedText>
                <TextInput
                  ref={inputRefMap[order]}
                  testID={`recover_word_${order}`}
                  placeholderTextColor={isLight
                    ? `${invalid && isTouched
                      ? 'rgba(255, 0, 0, 1)'
                      : 'rgba(0, 0, 0, 0.4)'}`
                    : `${invalid && isTouched ? 'rgba(255, 0, 0, 1)' : '#828282'}`}
                  style={tailwind(`flex-grow p-4 pl-0 ${invalid && isTouched ? 'text-error-500' : `${isLight ? light : dark}`}`)}
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
              </ThemedView>
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
