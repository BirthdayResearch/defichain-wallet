import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { StackScreenProps } from '@react-navigation/stack'
import { MnemonicUnprotected } from '@api/wallet'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Button } from '@components/Button'
import { CREATE_STEPS, CreateWalletStepIndicator } from '@components/CreateWalletStepIndicator'
import { ThemedIcon, ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { WalletParamList } from '../../WalletNavigator'
import { TouchableOpacity } from 'react-native'

type Props = StackScreenProps<WalletParamList, 'CreateMnemonicWallet'>

export interface CreateMnemonicWalletHandle {
  getMnemonicWords: () => void
}

export function CreateMnemonicWallet ({ navigation }: Props): JSX.Element {
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
          testID='reset_recovery_word_button'
        >
          <ThemedIcon
            dark={tailwind('text-darkprimary-500')}
            iconType='MaterialIcons'
            light={tailwind('text-primary-500')}
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
        title: translate('screens/CreateMnemonicWallet', 'Exit screen'),
        message: translate('screens/CreateMnemonicWallet', 'If you leave this screen, you will be provided with a new set of 24 recovery words. Do you want to proceed?'),
        buttons: [
          {
            text: translate('screens/CreateMnemonicWallet', 'Cancel'),
            style: 'cancel',
            onPress: () => {
            }
          },
          {
            text: translate('screens/CreateMnemonicWallet', 'Yes'),
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
    <ThemedScrollView
      dark={tailwind('bg-gray-900')}
      light={tailwind('bg-white')}
      style={tailwind('flex-1')}
    >
      <CreateWalletStepIndicator
        current={1}
        steps={CREATE_STEPS}
        style={tailwind('py-4 px-1')}
      />

      <ThemedText style={tailwind('font-semibold text-base p-4 text-center')}>
        {translate('screens/CreateMnemonicWallet', 'Take note of the words in their correct order')}
      </ThemedText>

      {(words.length > 0)
        ? words.map((word, index) => (
          <RecoveryWordRow
            key={index}
            index={index}
            word={word}
          />
          )
        )
        : <SkeletonLoader row={10} screen={SkeletonLoaderScreen.MnemonicWord} />}

      <Button
        label={translate('screens/CreateMnemonicWallet', 'VERIFY WORDS')}
        disabled={words.length === 0}
        onPress={onContinue}
        testID='verify_button'
        title='verify button'
      />
    </ThemedScrollView>
  )
}

function RecoveryWordRow (props: { index: number, word: string, key: number }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row')}
    >
      <ThemedText
        style={tailwind('w-12 font-semibold')}
        testID={`word_${props.index + 1}_number`}
      >
        {`${props.index + 1}.`}
      </ThemedText>

      <ThemedText
        style={tailwind('flex-grow font-semibold')}
        testID={`word_${props.index + 1}`}
      >
        {props.word}
      </ThemedText>
    </ThemedView>
  )
}
