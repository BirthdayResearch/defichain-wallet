import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useState } from 'react'
import { KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native'
import { MnemonicUnprotected } from '../../../api/wallet/provider/mnemonic_unprotected'
import { Text, TextInput, View } from '../../../components'
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { useWalletManagementContext } from '../../../contexts/WalletManagementContext'
import { tailwind } from '../../../tailwind'
import { WalletParamList } from '../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'WalletMnemonicCreateVerify'>

export function WalletMnemonicCreateVerify ({ route }: Props): JSX.Element {
  const actualWords = route.params.words
  const enteredWords: string[] = []

  const [valid, setValid] = useState<boolean>(true)
  const { network } = useNetworkContext()
  const { setWallet } = useWalletManagementContext()

  async function onVerify (): Promise<void> {
    if (actualWords.join(' ') === enteredWords.join(' ')) {
      await setWallet(MnemonicUnprotected.toData(enteredWords, network))
    } else {
      setValid(false)
    }
  }

  function MnemonicWordInputRow (props: { index: number, word: string }): JSX.Element {
    const [valid, setValid] = useState<boolean>(true)

    return (
      <View style={tailwind('bg-white pl-4 mb-3 flex-row items-center')}>
        <Text style={[
          tailwind('w-6 font-medium'),
          valid ? tailwind('text-gray-500') : tailwind('text-red-500')
        ]}
        >
          {`${props.index + 1}`.padStart(2, '0')}
        </Text>
        <TextInput
          style={tailwind('flex-grow py-4 pr-4 font-bold text-gray-800')}
          autoCapitalize='none'
          onChangeText={(text) => {
            setValid(props.word === text.trim())
            enteredWords[props.index] = text.trim()
          }}
          placeholder='enter phrase'
        />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={tailwind('flex-1 justify-center')} behavior='padding' enabled
      keyboardVerticalOffset={100}
    >
      <ScrollView style={tailwind('flex-1 bg-gray-100')} contentInsetAdjustmentBehavior='automatic'>
        <Text style={tailwind('mx-4 my-5 font-medium')}>
          To ensure you have a copy of your mnemonic phrase for safety and recovery purpose,
          please enter your 24 word mnemonic phrase for verification.
        </Text>

        <View>
          {actualWords.map((word, index) => {
            return <MnemonicWordInputRow word={word} index={index} key={index} />
          })}
        </View>

        {valid ? null : (
          <View style={tailwind('mx-4 my-2')}>
            <Text style={tailwind('text-red-500 font-medium')}>
              Your 24 word mnemonic phrase verification failed, please check your have entered the correct phrase.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[tailwind('m-4 rounded flex items-center justify-center bg-primary')]}
          onPress={onVerify}
        >
          <Text style={tailwind('p-3 font-bold text-white')}>
            VERIFY MNEMONIC
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
