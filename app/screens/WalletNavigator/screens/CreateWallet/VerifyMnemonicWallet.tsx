import { StackScreenProps } from '@react-navigation/stack'
import arrayShuffle from 'array-shuffle'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, TouchableOpacity } from 'react-native'
import { MnemonicUnprotected } from '../../../../api/wallet/provider/mnemonic_unprotected'
import { Text, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { useNetworkContext } from '../../../../contexts/NetworkContext'
import { useWalletManagementContext } from '../../../../contexts/WalletManagementContext'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'VerifyMnemonicWallet'>

interface VerifyMnemonicItem {
  index: number
  words: string[]
}

export function VerifyMnemonicWallet ({ route, navigation }: Props): JSX.Element {
  const recoveryWords = route.params.words

  if (!Array.isArray(recoveryWords) || recoveryWords === undefined) {
    navigation.navigate('CreateMnemonicWallet')
    return <></>
  }

  const [selectedWords, setSelectedWords] = useState<string[]>([...recoveryWords])
  const [randomWords, setRandomWords] = useState<VerifyMnemonicItem[]>([])
  const [isValid, setValid] = useState<boolean>(false)
  const { network } = useNetworkContext()
  const { setWallet } = useWalletManagementContext()

  useEffect(() => {
    const random: number[] = Array.from(Array(24), (v, i) => i)
    const randomNumbers = arrayShuffle(random)
    const firstSix = randomNumbers.slice(0, 6)
    const others = randomNumbers.slice(6, randomNumbers.length)
    firstSix.forEach((randomNumber, i) => {
      const counter = 3 * i
      selectedWords[randomNumber] = ''
      const words = arrayShuffle([recoveryWords[randomNumber], recoveryWords[others[counter]], recoveryWords[others[counter + 1]], recoveryWords[others[counter + 2]]])
      randomWords.push({ index: randomNumber, words })
    })
    setSelectedWords([...selectedWords])
    setRandomWords([...randomWords])
  }, [JSON.stringify(recoveryWords)])

  async function onVerify (): Promise<void> {
    if (recoveryWords.join(' ') === selectedWords.join(' ')) {
      await setWallet(MnemonicUnprotected.toData(selectedWords, network))
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

  return (
    <ScrollView style={tailwind('flex-1 bg-white')}>
      <Text style={tailwind('pt-4 font-semibold text-base px-4 text-center')}>
        {translate('screens/VerifyMnemonicWallet', 'Verify what you wrote as correct.')}
      </Text>
      <Text style={tailwind('font-semibold text-base px-4 text-center')}>
        {translate('screens/VerifyMnemonicWallet', 'Answer the questions to proceed.')}
      </Text>

      {randomWords.map((n, index) => (
        <RecoveryWordRow
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
        title='verify mnemonic'
        key='verify_words_button'
        label={translate('screens/VerifyMnemonicWallet', 'VERIFY')}
      />
    </ScrollView>
  )
}

interface RecoveryWordItem {
  index: number
  words: string[]
  onWordSelect: (word: string) => void
}

function RecoveryWordRow ({ index, words, onWordSelect }: RecoveryWordItem): JSX.Element {
  const [selectedWord, setSelectedWord] = useState<string>()
  const activeButton = 'bg-primary bg-opacity-10 border border-primary border-opacity-20'
  return (
    <View style={tailwind('bg-white p-4 py-6 border-b border-gray-200')}>
      <Text style={tailwind('text-gray-600')}>
        {translate('screens/VerifyMnemonicWallet', `What is word #${index + 1}?`)}
      </Text>
      <View style={tailwind('flex-row mt-4 mb-2')}>
        {
          words.map((w, i) => (
            <TouchableOpacity
              style={tailwind(`rounded border ${selectedWord === w ? activeButton : 'bg-gray-100 border-gray-100'} p-1 px-2 mr-3`)}
              key={`${w}_${i}`}
              testID={`${w}_select`}
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
