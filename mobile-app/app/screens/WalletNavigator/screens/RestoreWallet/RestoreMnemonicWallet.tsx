import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { validateMnemonicSentence } from '@defichain/jellyfish-wallet-mnemonic'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { createRef, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { TextInput } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { View } from '@components/index'
import { Button } from '@components/Button'
import { CreateWalletStepIndicator, RESTORE_STEPS } from '@components/CreateWalletStepIndicator'
import { ThemedText, ThemedView } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { WalletTextInput } from '@components/WalletTextInput'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '../../WalletNavigator'

export function RestoreMnemonicWallet (): JSX.Element {
  const navigation = useNavigation<NavigationProp<WalletParamList>>()
  const {
    control,
    formState: {
      isValid,
      isDirty
    },
    getValues,
    trigger
  } = useForm({ mode: 'onChange' })
  const [recoveryWords] = useState<number[]>(Array.from(Array(24), (v, i) => i + 1))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputRefMap, setInputRefMap] = useState<Array<React.RefObject<TextInput>>>([])
  const { isLight } = useThemeContext()

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
            text: translate('screens/RestoreWallet', 'Cancel'),
            style: 'cancel',
            onPress: () => {
            }
          },
          {
            text: translate('screens/RestoreWallet', 'Discard'),
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

  return (
    <KeyboardAwareScrollView style={tailwind(`${isLight ? 'bg-white' : 'bg-gray-900'}`)}>
      <CreateWalletStepIndicator
        current={1}
        steps={RESTORE_STEPS}
        style={tailwind('py-4 px-1')}
      />

      <View style={tailwind('justify-center p-4')}>
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-900')}
          style={tailwind('font-medium text-sm text-center')}
        >
          {translate('screens/RestoreWallet', 'Please provide your 24 recovery words to regain access to your wallet.')}
        </ThemedText>
      </View>

      {recoveryWords.map((order) => (
        (inputRefMap?.[order] != null)
          ? (<Controller
              control={control}
              defaultValue=''
              key={order}
              name={`recover_word_${order}`}
              render={({ field: { name, value, onChange }, fieldState: { invalid, isTouched, error } }) => (
                <ThemedView
                  dark={tailwind('bg-gray-900')}
                  light={tailwind('bg-white')}
                  style={tailwind('flex-row pb-1')}
                >
                  <ThemedText style={tailwind('mx-3 mt-4 text-sm w-6 text-center')}>
                    {`${order}.`}
                  </ThemedText>
                  <WalletTextInput
                    autoCapitalize='none'
                    autoCompleteType='off'
                    blurOnSubmit={false}
                    onBlur={async () => {
                      onChange(value.trim())
                      await trigger(name)
                    }}
                    inputType='default'
                    keyboardType='default'
                    onChangeText={onChange}
                    onSubmitEditing={async () => {
                      if (inputRefMap[order + 1] !== undefined) {
                        inputRefMap[order + 1].current?.focus()
                      } else {
                        await onRestore()
                      }
                    }}
                    placeholder={translate('screens/RestoreWallet', 'Enter word #{{order}}', { order })}
                    placeholderTextColor={isLight
                      ? `${invalid && isTouched
                        ? 'rgba(255, 0, 0, 1)'
                        : 'rgba(0, 0, 0, 0.4)'}`
                      : `${invalid && isTouched ? 'rgba(255, 0, 0, 1)' : '#828282'}`}
                    ref={inputRefMap[order]}
                    returnKeyType={order === 24 ? 'done' : 'next'}
                    containerStyle='w-10/12'
                    style={tailwind('w-full')}
                    valid={!invalid}
                    testID={`recover_word_${order}`}
                    value={value}
                    inlineText={{
                      type: 'error',
                      text: error?.message
                    }}
                  />
                </ThemedView>
              )}
              rules={{
                validate: (value) => {
                  const trimmedValue = value.trim()
                    if (trimmedValue === undefined || trimmedValue === '') {
                      return translate('screens/RestoreWallet', 'Required field is missing')
                    } else if (!/^[a-z]+$/.test(trimmedValue)) {
                      return translate('screens/RestoreWallet', 'Uppercase, numbers and special characters are not allowed')
                    }

                    return true
                }
              }}
             />)
          : <SkeletonLoader key={order} row={1} screen={SkeletonLoaderScreen.MnemonicWord} />
      ))}

      <Button
        disabled={!isValid || isSubmitting}
        label={translate('screens/RestoreWallet', 'RESTORE WALLET')}
        onPress={onRestore}
        testID='recover_wallet_button'
        title='recover_wallet'
      />
    </KeyboardAwareScrollView>
  )
}
