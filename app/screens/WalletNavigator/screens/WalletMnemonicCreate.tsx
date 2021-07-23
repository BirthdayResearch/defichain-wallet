import { generateMnemonic } from '@defichain/jellyfish-wallet-mnemonic'
import { StackScreenProps } from '@react-navigation/stack'
import * as Random from 'expo-random'
import * as React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Text, View } from '../../../components'
import { VectorIcon } from '../../../constants/Theme'
import { tailwind } from '../../../tailwind'
import { WalletParamList } from '../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'WalletMnemonicCreate'>

export function WalletMnemonicCreate ({ navigation }: Props): JSX.Element {
  const words = generateMnemonic(24, numOfBytes => {
    const bytes = Random.getRandomBytes(numOfBytes)
    return Buffer.from(bytes)
  })

  function onContinue (): void {
    navigation.navigate('WalletMnemonicCreateVerify', {
      words: words
    })
  }

  return (
    <ScrollView style={tailwind('flex-1 bg-gray-100')} contentInsetAdjustmentBehavior='automatic'>
      <View style={tailwind('mx-4 mt-6')}>
        <Text style={tailwind('font-bold text-xl')}>
          What is a Mnemonic phrase?
        </Text>
        <Text style={tailwind('mt-2')}>
          Mnemonic phrase is a set of randomly generated words that represent your wallet password.
          The phrase is cryptographically unique. Once generated, it is impossible to recover that phrase.
        </Text>
        <View style={tailwind('flex-1')}>
          <MnemonicTipRow positive text='Write down the 24 words and store them in a safe and secured place.' />
          <MnemonicTipRow positive={false} text='Never share your mnemonic phrase with anyone.' />
          <MnemonicTipRow positive={false} text='Never store it on a computer, phone or any other digital devices.' />
          <MnemonicTipRow positive={false} text='Without a backup, there is no way your can recover it.' />
        </View>
      </View>

      <View style={tailwind('mt-6')}>
        <Text style={tailwind('mx-4 mb-4 font-bold text-xl')}>
          Your 24 word Mnemonic phrase
        </Text>
        {words.map((word, index) => {
          return <MnemonicWordRow word={word} index={index} key={index} />
        })}
      </View>

      <TouchableOpacity
        style={[tailwind('m-4 rounded flex items-center justify-center bg-primary')]}
        onPress={onContinue}
      >
        <Text style={tailwind('p-3 font-bold text-white')}>CONTINUE</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function MnemonicWordRow (props: { index: number, word: string }): JSX.Element {
  return (
    <View style={tailwind('bg-white mx-4 mb-3 rounded')}>
      <View style={tailwind('px-4 py-4 flex-row items-center')}>
        <Text style={[tailwind('w-6 text-gray-500 font-medium')]}>
          {`${props.index + 1}`.padStart(2, '0')}
        </Text>
        <Text style={tailwind('flex-grow font-bold text-gray-800')}>
          {props.word}
        </Text>
      </View>
    </View>
  )
}

function MnemonicTipRow (props: { positive: boolean, text: string }): JSX.Element {
  return (
    <View style={tailwind('flex-row mt-3')}>
      <VectorIcon size={24} name={props.positive ? 'check' : 'error'} style={tailwind('text-primary')} />
      <Text style={tailwind('flex-1 ml-2 text-sm')}>
        {props.text}
      </Text>
    </View>
  )
}
