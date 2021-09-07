import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { useWalletMnemonicConext } from '@contexts/WalletMnemonic'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button'
import { CREATE_STEPS, CreateWalletStepIndicator } from '../../../../components/CreateWalletStepIndicator'
import { ThemedScrollView, ThemedText, ThemedView } from '../../../../components/themed'
import { WalletAlert } from '../../../../components/WalletAlert'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'CreateMnemonicWallet'>

export function CreateMnemonicWallet ({ navigation }: Props): JSX.Element {
  const { mnemonicWords, generateMnemonicWords, flushMnemonicWords } = useWalletMnemonicConext()
  const [words, setWords] = useState<string[]>([])

  useEffect(() => {
    setWords([])
    // to show animation for setting new mnemonic
    setTimeout(() => {
      setWords(mnemonicWords)
    }, 1000)
  }, [mnemonicWords])

  useEffect(() => {
    generateMnemonicWords()
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
      flushMnemonicWords()
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
        ? words.map((word, index) => {
        return (
          <RecoveryWordRow
            index={index}
            key={index}
            word={word}
          />
        )
      })
      : <SkeletonLoader row={10} screen={SkeletonLoaderScreen.MnemonicWord} />}

      <Button
        label={translate('screens/CreateMnemonicWallet', 'VERIFY WORDS')}
        onPress={onContinue}
        testID='verify_button'
        title='verify button'
      />
    </ThemedScrollView>
  )
}

function RecoveryWordRow (props: { index: number, word: string }): JSX.Element {
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
