import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { StackScreenProps } from '@react-navigation/stack'
import { MnemonicUnprotected } from '@api/wallet'
import { useEffect, useLayoutEffect, useState } from 'react'
import { CREATE_STEPS, CreateWalletStepIndicatorV2 } from '@components/CreateWalletStepIndicatorV2'
import { ThemedIcon, ThemedScrollViewV2, ThemedTextV2, ThemedViewV2 } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamListV2 } from '../../WalletNavigator'
import { Platform, TouchableOpacity } from 'react-native'
import { View } from '@components'
import { ButtonV2 } from '@components/ButtonV2'

type Props = StackScreenProps<WalletParamListV2, 'CreateMnemonicWallet'>

export interface CreateMnemonicWalletHandle {
  getMnemonicWords: () => void
}

export function CreateMnemonicWalletV2 ({ navigation }: Props): JSX.Element {
  const [words, setWords] = useState<string[]>(MnemonicUnprotected.generateWords())

  const refreshRecoveryWords = (): void => {
    WalletAlert({
      title: translate('screens/WalletNavigator', 'Refresh recovery words'),
      message: translate(
        'screens/WalletNavigator', 'You are about to generate a new set of recovery words. Continue?'),
      buttons: [
        {
          text: translate('screens/WalletNavigator', 'Cancel'),
          style: 'cancel'
        },
        {
          text: translate('screens/WalletNavigator', 'Refresh'),
          style: 'destructive',
          onPress: async () => {
            setWords([])
            setTimeout(() => {
              setWords(MnemonicUnprotected.generateWords())
            }, 1000)
          }
        }
      ]
    })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (): JSX.Element => (
        <TouchableOpacity
          onPress={refreshRecoveryWords}
          style={tailwind({ 'mr-3': Platform.OS === 'android' })}
          testID='reset_recovery_word_button'
        >
          <ThemedIcon
            iconType='MaterialIcons'
            dark={tailwind('text-mono-dark-v2-900')}
            light={tailwind('text-mono-light-v2-900')}
            name='refresh'
            size={24}
          />
        </TouchableOpacity>
      )
    })
  }, [navigation])

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      e.preventDefault()
      WalletAlert({
        title: translate('screens/CreateMnemonicWallet', 'Leave wallet creation?'),
        message: translate('screens/CreateMnemonicWallet', 'A new set of recovery words will be generated for the wallet once you leave this page.'),
        buttons: [
          {
            text: translate('screens/CreateMnemonicWallet', 'Return'),
            style: 'cancel',
            onPress: () => {
            }
          },
          {
            text: translate('screens/CreateMnemonicWallet', 'Leave'),
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
  }, [navigation])

  function onContinue (): void {
    navigation.navigate({
      name: 'VerifyMnemonicWallet',
      params: {
        words
      },
      merge: true
    })
  }

  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('pt-12 px-5 pb-16')}
      style={tailwind('flex-1')}
    >
      <View style={tailwind('px-5 mb-12')}>
        <CreateWalletStepIndicatorV2
          current={1}
          steps={CREATE_STEPS}
          style={tailwind('px-4')}
        />

        <ThemedTextV2
          style={tailwind('text-base mt-7 text-center font-normal-v2')}
        >
          {translate('screens/CreateMnemonicWallet', 'Write down the words. Take note of the spelling and order.')}
        </ThemedTextV2>
      </View>
      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-2lg')}
      >
        {(words.length > 0)
          ? words.map((word, index) => (
            <RecoveryWordRow
              key={index}
              index={index}
              word={word}
              border={index < words.length - 1}
            />
            )
          )
          : <SkeletonLoader row={10} screen={SkeletonLoaderScreen.MnemonicWordV2} />}
      </ThemedViewV2>

      <ButtonV2
        styleProps='mt-12 mx-7'
        label={translate('screens/CreateMnemonicWallet', 'Verify words')}
        disabled={words.length === 0}
        onPress={onContinue}
        testID='verify_button'
      />
    </ThemedScrollViewV2>
  )
}

function RecoveryWordRow (props: { index: number, word: string, key: number, border: boolean }): JSX.Element {
  return (
    <ThemedViewV2
      dark={tailwind('border-mono-dark-v2-300')}
      light={tailwind('border-mono-light-v2-300')}
      style={tailwind(['py-4 mx-5 flex-row justify-center', { 'border-b': props.border }])}
    >
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-500')}
        light={tailwind('text-mono-light-v2-500')}
        style={tailwind('w-12 text-sm font-normal-v2')}
        testID={`word_${props.index + 1}_number`}
      >
        {`${props.index + 1}.`}
      </ThemedTextV2>

      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-700')}
        light={tailwind('text-mono-light-v2-700')}
        style={tailwind('flex-grow text-sm font-normal-v2')}
        testID={`word_${props.index + 1}`}
      >
        {props.word}
      </ThemedTextV2>
    </ThemedViewV2>
  )
}
