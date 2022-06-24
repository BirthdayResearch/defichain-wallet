import { CREATE_STEPS, CreateWalletStepIndicator } from '@components/CreateWalletStepIndicatorV2'
import { View } from '@components/index'
import { ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { getEnvironment } from '@environment'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { shuffle } from 'lodash'
import { useEffect, useState } from 'react'
import { WalletParamList } from '../../WalletNavigator'
import { getReleaseChannel } from '@api/releaseChannel'
import { Button } from '@components/ButtonV2'

type Props = StackScreenProps<WalletParamList, 'VerifyMnemonicWallet'>

interface VerifyMnemonicItem {
  index: number
  words: string[]
}

const HARDCODED_PIN_LENGTH = 6

export function VerifyMnemonicWallet ({ route, navigation }: Props): JSX.Element {
  const recoveryWords = route.params.words

  const [selectedWords, setSelectedWords] = useState<string[]>([...recoveryWords])
  const [randomWords, setRandomWords] = useState<VerifyMnemonicItem[]>([])
  const [isValid, setValid] = useState<boolean>(false)

  useEffect(() => {
    const random: number[] = Array.from(Array(24), (v, i) => i)
    const randomNumbers = shuffle(random)
    const firstSix = randomNumbers.slice(0, 6)
    const others = randomNumbers.slice(6, randomNumbers.length)
    firstSix.forEach((randomNumber, i) => {
      const counter = 3 * i
      selectedWords[randomNumber] = ''
      const words = shuffle([recoveryWords[randomNumber], recoveryWords[others[counter]], recoveryWords[others[counter + 1]], recoveryWords[others[counter + 2]]])
      randomWords.push({
        index: randomNumber,
        words
      })
    })
    setSelectedWords([...selectedWords])
    setRandomWords([...randomWords])
  }, [JSON.stringify(recoveryWords)])

  if (!Array.isArray(recoveryWords) || recoveryWords === undefined) {
    navigation.navigate('CreateMnemonicWallet')
    return <></>
  }

  function navigateToPinCreation (): void {
    navigation.navigate({
      name: 'PinCreation',
      params: {
        pinLength: HARDCODED_PIN_LENGTH,
        words: recoveryWords,
        type: 'create'
      },
      merge: true
    })
  }

  function onVerify (): void {
    if (recoveryWords.join(' ') === selectedWords.join(' ')) {
      navigateToPinCreation()
    } else {
      WalletAlert({
        title: '',
        message: translate('screens/VerifyMnemonicWallet', 'Invalid selection. Please ensure you have written down your 24 words.'),
        buttons: [
          {
            text: translate('screens/VerifyMnemonicWallet', 'Go back'),
            onPress: () => navigation.navigate('CreateMnemonicWallet'),
            style: 'destructive'
          }
        ]
      })
    }
  }

  function debugBypass (): void {
    if (getEnvironment(getReleaseChannel()).debug) {
      navigateToPinCreation()
    }
  }

  return (
    <ThemedScrollView
      dark={tailwind('bg-mono-dark-v2-100')}
      light={tailwind('bg-mono-light-v2-100')}
      contentContainerStyle={tailwind('pt-12 px-5 pb-16')}
      style={tailwind('flex-1')}
    >
      <View style={tailwind('px-5 mb-12')}>
        <CreateWalletStepIndicator
          current={2}
          steps={CREATE_STEPS}
          style={tailwind('px-4')}
        />

        <ThemedText
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          style={tailwind('text-base mt-7 text-center')}
        >
          {translate('screens/VerifyMnemonicWallet', 'Verify the written recovery words.')}
        </ThemedText>
      </View>

      {randomWords.map((n, index) => (
        <RecoveryWordRow
          index={n.index}
          key={index}
          lineNumber={index}
          onWordSelect={(word) => {
            selectedWords[n.index] = word
            setSelectedWords([...selectedWords])
            setValid(!selectedWords.some((w) => w === ''))
          }}
          words={n.words}
        />
      ))}

      <ThemedText
        dark={tailwind('text-mono-dark-v2-900')}
        light={tailwind('text-mono-light-v2-900')}
        style={tailwind('text-base mt-7 text-center')}
      >
        {translate('screens/VerifyMnemonicWallet', 'All questions must be answered correctly.')}
      </ThemedText>

      <Button
        styleProps='mt-5 mx-7'
        delayLongPress={1000}
        disabled={!isValid}
        onLongPress={debugBypass}
        onPress={onVerify}
        testID='verify_words_button'
        label={translate('screens/VerifyMnemonicWallet', 'Verify words')}
      />
    </ThemedScrollView>
  )
}

interface RecoveryWordItem {
  index: number
  words: string[]
  onWordSelect: (word: string) => void
  lineNumber: number
}

function RecoveryWordRow ({ index, words, onWordSelect, lineNumber }: RecoveryWordItem): JSX.Element {
  const [selectedWord, setSelectedWord] = useState<string>()
  return (
    <View style={tailwind('mb-5')}>
      <View style={tailwind('flex-row')}>
        <ThemedText
          style={tailwind('text-xs')}
          light={tailwind('text-mono-light-v2-400')}
          dark={tailwind('text-mono-dark-v2-400')}
          testID={`line_${lineNumber}`}
        >
          {numberOrdinal(index + 1)}
        </ThemedText>
        <ThemedText
          style={tailwind('text-xs ml-1')}
          light={tailwind('text-mono-light-v2-400')}
          dark={tailwind('text-mono-dark-v2-400')}
        >
          {translate('screens/VerifyMnemonicWallet', 'word')}
        </ThemedText>
      </View>

      <ThemedView
        light={tailwind('bg-mono-light-v2-00')}
        dark={tailwind('bg-mono-dark-v2-00')}
        style={tailwind('flex flex-row mt-2 justify-between items-center w-full rounded-3xl')}
        testID={`recovery_word_row_${index}`}
      >
        {
          words.map((w, i) => (
            <ThemedTouchableOpacity
              key={`${w}_${i}`}
              onPress={() => {
                setSelectedWord(w)
                onWordSelect(w)
              }}
              dark={tailwind({ 'bg-mono-dark-v2-900': selectedWord === w })}
              light={tailwind({ 'bg-mono-light-v2-900': selectedWord === w })}
              style={tailwind('rounded py-3 w-1/4 rounded-3xl')}
              testID={`line_${lineNumber}_${w}`}
            >
              <ThemedText
                style={tailwind('text-center text-xs')}
                dark={tailwind(`${selectedWord === w ? 'text-mono-dark-v2-100' : 'text-mono-dark-v2-400'}`)}
                light={tailwind(`${selectedWord === w ? 'text-mono-light-v2-100' : 'text-mono-light-v2-400'}`)}
              >
                {w}
              </ThemedText>
            </ThemedTouchableOpacity>
          ))
        }
      </ThemedView>
    </View>
  )
}

function numberOrdinal (n: number): string {
  let suffix = 'th'
  if (n === 1 || n === 21) {
    suffix = 'st'
  }
  if (n === 2 || n === 22) {
    suffix = 'nd'
  }
  if (n === 3 || n === 23) {
    suffix = 'rd'
  }
  return `${n}${suffix}`
};
