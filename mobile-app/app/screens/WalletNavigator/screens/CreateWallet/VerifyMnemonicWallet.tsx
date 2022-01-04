import { Button } from '@components/Button'
import { CREATE_STEPS, CreateWalletStepIndicator } from '@components/CreateWalletStepIndicator'
import { View } from '@components/index'
import { ThemedScrollView, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { WalletAlert } from '@components/WalletAlert'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { getEnvironment } from '@environment'
import { StackScreenProps } from '@react-navigation/stack'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { shuffle } from 'lodash'
import { useEffect, useState } from 'react'
import { WalletParamList } from '../../WalletNavigator'
import { getReleaseChannel } from '@api/releaseChannel'

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
      dark={tailwind('bg-gray-900')}
      light={tailwind('bg-white')}
      style={tailwind('flex-1')}
    >
      <CreateWalletStepIndicator
        current={2}
        steps={CREATE_STEPS}
        style={tailwind('py-4 px-1')}
      />

      <ThemedText style={tailwind('pt-4 font-semibold text-base px-4 text-center')}>
        {translate('screens/VerifyMnemonicWallet', 'Verify what you wrote as correct.')}
      </ThemedText>

      <ThemedText style={tailwind('font-semibold text-base px-4 mb-4 text-center')}>
        {translate('screens/VerifyMnemonicWallet', 'Answer the questions to proceed.')}
      </ThemedText>

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

      <Button
        delayLongPress={1000}
        disabled={!isValid}
        label={translate('screens/VerifyMnemonicWallet', 'VERIFY')}
        onLongPress={debugBypass}
        onPress={onVerify}
        testID='verify_words_button'
        title='verify mnemonic'
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
  const { isLight } = useThemeContext()
  const activeButton = isLight ? 'bg-primary-50' : 'bg-darkprimary-500'
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 py-6')}
    >
      <View style={tailwind('flex-row')}>
        <ThemedText style={tailwind('text-gray-600')}>
          {translate('screens/VerifyMnemonicWallet', 'What is word ')}
        </ThemedText>

        <ThemedText
          style={tailwind('text-black font-semibold')}
          testID={`line_${lineNumber}`}
        >
          {`#${index + 1}?`}
        </ThemedText>
      </View>

      <View
        style={tailwind('flex-row mt-4 -mb-1 -mr-3 flex-wrap')}
        testID={`recovery_word_row_${index}`}
      >
        {
          words.map((w, i) => (
            <ThemedTouchableOpacity
              dark={tailwind(`${selectedWord === w ? activeButton : 'bg-gray-400'}`)}
              key={`${w}_${i}`}
              light={tailwind(`${selectedWord === w ? activeButton : 'bg-gray-100'}`)}
              onPress={() => {
                setSelectedWord(w)
                onWordSelect(w)
              }}
              style={tailwind('rounded p-2 px-3 mr-3 mb-3')}
              testID={`line_${lineNumber}_${w}`}
            >
              <ThemedText
                dark={tailwind(`${selectedWord === w ? 'text-white' : 'text-black'} font-semibold`)}
                light={tailwind(`${selectedWord === w ? 'text-primary-500' : 'text-black'} font-semibold`)}
              >
                {w}
              </ThemedText>
            </ThemedTouchableOpacity>
          ))
        }
      </View>
    </ThemedView>
  )
}
