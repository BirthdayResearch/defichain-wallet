import { validateMnemonic } from '@defichain/jellyfish-wallet-mnemonic'
import * as React from 'react'
import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import tailwind from 'tailwind-rn'
import { PrimaryColorStyle } from '../../../constants/Theme'
import { useWalletAPI } from '../../../hooks/wallet/WalletAPI'

export function WalletMnemonicRestore (): JSX.Element {
  const [phrase, setPhrase] = useState<string>('')

  const [valid, setValid] = useState<boolean>(true)
  const WalletAPI = useWalletAPI()
  const dispatch = useDispatch()

  function onRestore (): void {
    const words = phrase.split(' ')
    if (validateMnemonic(words)) {
      WalletAPI.setMnemonic(dispatch, words)
    } else {
      setValid(false)
    }
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')} contentInsetAdjustmentBehavior='automatic'>
      <Text style={tailwind('font-medium mt-6 px-4')}>
        Your 24 word mnemonic phrase
      </Text>

      <TextInput
        style={tailwind('bg-white font-medium mt-4 p-4 h-32')}
        multiline
        numberOfLines={4}
        textAlignVertical='top'
        placeholder='Enter your 24 word mnemonic phrase separated by spaces'
        onChangeText={setPhrase}
      />

      {valid ? null : (
        <View style={tailwind('mx-4 mt-4')}>
          <Text style={tailwind('text-red-500 font-medium')}>
            Unable to verify your 24 word mnemonic phrase, please check you have entered the correct phrase.
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={onRestore}
        style={[tailwind('my-6 mx-4 rounded flex items-center justify-center'), PrimaryColorStyle.bg]}
      >
        <Text style={tailwind('p-3 font-bold text-white')}>
          RESTORE
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
