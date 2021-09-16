import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { StackScreenProps } from '@react-navigation/stack'
import { MnemonicUnprotected } from '../../../../api/wallet'
import * as React from 'react'
import { forwardRef, useEffect, useState, useImperativeHandle } from 'react'
import { Button } from '../../../../components/Button'
import { CREATE_STEPS, CreateWalletStepIndicator } from '../../../../components/CreateWalletStepIndicator'
import { ThemedScrollView, ThemedText, ThemedView } from '../../../../components/themed'
import { WalletAlert } from '../../../../components/WalletAlert'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'CreateMnemonicWallet'>

export interface CreateMnemonicWalletHandle {
  getMnemonicWords: () => void
}

export const CreateMnemonicWallet = forwardRef(
  function ({ navigation }: Props, ref: React.Ref<unknown> | undefined): JSX.Element {
    const [words, setWords] = useState<string[]>(MnemonicUnprotected.generateWords())

    useImperativeHandle(ref, () => ({
      getMnemonicWords () {
        setWords([])
        setTimeout(() => {
          setWords(MnemonicUnprotected.generateWords())
        }, 1000)
      }
    }), [])

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
        dark={tailwind('bg-blue-900')}
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
)

function RecoveryWordRow (props: { index: number, word: string, key: number }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-blue-800 border-b border-blue-900')}
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
