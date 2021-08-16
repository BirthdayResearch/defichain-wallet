import { StackScreenProps } from '@react-navigation/stack'
import { shuffle } from 'lodash'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Alert, Platform, ScrollView, TouchableOpacity } from 'react-native'
import { Text, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { CREATE_STEPS, CreateWalletStepIndicator } from '../../../../components/CreateWalletStepIndicator'
import { getEnvironment } from '../../../../environment'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'VerifyMnemonicWallet'>

interface VerifyMnemonicItem {
  index: number
  words: string[]
}

const HARDCODED_PIN_LENGTH = 6

export function VerifyMnemonicWallet ({ route, navigation }: Props): JSX.Element {
  const recoveryWords = route.params.words

  if (!Array.isArray(recoveryWords) || recoveryWords === undefined) {
    navigation.navigate('CreateMnemonicWallet')
    return <></>
  }

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
      randomWords.push({ index: randomNumber, words })
    })
    setSelectedWords([...selectedWords])
    setRandomWords([...randomWords])
  }, [JSON.stringify(recoveryWords)])

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
      if (Platform.OS === 'web') {
        navigation.navigate('CreateMnemonicWallet')
      } else {
        Alert.alert(
          '',
          translate('screens/VerifyMnemonicWallet', 'Invalid selection. Please ensure you have written down your 24 words.'),
          [
            {
              text: translate('screens/VerifyMnemonicWallet', 'Go back'),
              onPress: () => navigation.navigate('CreateMnemonicWallet'),
              style: 'destructive'
            }
          ]
        )
      }
    }
  }

  function debugBypass (): void {
    if (getEnvironment().debug) {
      navigateToPinCreation()
    }
  }

  return (
    <ScrollView style={tailwind('flex-1 bg-white')}>
      <CreateWalletStepIndicator
        current={2}
        steps={CREATE_STEPS}
        style={tailwind('py-4 px-1')}
      />
      <Text style={tailwind('pt-4 font-semibold text-base px-4 text-center')}>
        {translate('screens/VerifyMnemonicWallet', 'Verify what you wrote as correct.')}
      </Text>
      <Text style={tailwind('font-semibold text-base px-4 text-center')}>
        {translate('screens/VerifyMnemonicWallet', 'Answer the questions to proceed.')}
      </Text>

      {randomWords.map((n, index) => (
        <RecoveryWordRow
          lineNumber={index}
          words={n.words} index={n.index} key={index} onWordSelect={(word) => {
            selectedWords[n.index] = word
            setSelectedWords([...selectedWords])
            setValid(!selectedWords.some((w) => w === ''))
          }}
        />
      ))}

      <Button
        disabled={!isValid}
        onPress={onVerify}
        delayLongPress={1000}
        onLongPress={debugBypass}
        title='verify mnemonic'
        testID='verify_words_button'
        label={translate('screens/VerifyMnemonicWallet', 'VERIFY')}
      />
    </ScrollView>
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
  const activeButton = 'bg-primary bg-opacity-10 border border-primary border-opacity-20'
  return (
    <View style={tailwind('bg-white p-4 py-6 border-b border-gray-200')}>
      <View style={tailwind('flex-row')}>
        <Text style={tailwind('text-gray-600')}>
          {translate('screens/VerifyMnemonicWallet', 'What is word ')}
        </Text>
        <Text testID={`line_${lineNumber}`} style={tailwind('text-black font-semibold')}>
          {`#${index + 1}?`}
        </Text>
      </View>
      <View style={tailwind('flex-row mt-4 mb-2')} testID={`recovery_word_row_${index}`}>
        {
          words.map((w, i) => (
            <TouchableOpacity
              style={tailwind(`rounded border ${selectedWord === w ? activeButton : 'bg-gray-100 border-gray-100'} p-1 px-2 mr-3`)}
              key={`${w}_${i}`}
              testID={`line_${lineNumber}_${w}`}
              onPress={() => {
                setSelectedWord(w)
                onWordSelect(w)
              }}
            >
              <Text style={tailwind(`${selectedWord === w ? 'text-primary' : 'text-black'} font-semibold`)}>{w}</Text>
            </TouchableOpacity>
          ))
        }
      </View>
    </View>
  )
}
