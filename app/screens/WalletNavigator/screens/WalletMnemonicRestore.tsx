import { validateMnemonicSentence } from '@defichain/jellyfish-wallet-mnemonic'
import * as React from 'react'
import { createRef, useEffect, useState } from 'react'
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { MnemonicUnprotected } from '../../../api/wallet/provider/mnemonic_unprotected'
import { Text, View } from '../../../components'
import { SectionTitle } from "../../../components/SectionTitle";
import { useNetworkContext } from '../../../contexts/NetworkContext'
import { useWalletManagementContext } from '../../../contexts/WalletManagementContext'
import { tailwind } from '../../../tailwind'
import { translate } from "../../../translations";

export function WalletMnemonicRestore (): JSX.Element {
  const { network } = useNetworkContext()
  const { setWallet } = useWalletManagementContext()
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })
  const [phrase, setPhrase] = useState<string>('')
  const [valid, setValid] = useState<boolean>(true)
  const [recoveryWords] = useState<number[]>(Array.from(Array(24), (v, i) => i + 1))
  const [inputRefMap, setInputRefMap] = useState<any[]>([])

  useEffect(() => {
    recoveryWords.forEach((r) => {
      inputRefMap[r] = createRef()
      setInputRefMap(inputRefMap)
    })
  }, [])

  async function onRestore (): Promise<void> {
    const words = phrase.split(' ')
    if (validateMnemonicSentence(words)) {
      await setWallet(MnemonicUnprotected.toData(words, network))
    } else {
      setValid(false)
    }
  }

  const onSubmit = () => {
    console.log('Hello World')
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <View style={tailwind('justify-center p-4 bg-white')}>
        <Text style={tailwind('font-medium text-sm text-gray-500 text-center')}>
          {translate('screens/RestoreWallet', 'Please provide your 24 recovery words to regain access to your wallet.')}
        </Text>
      </View>
      <SectionTitle
        text={translate('screens/RestoreWallet', 'ENTER THE CORRECT WORD')}
        testID='recover_title' />
      {
        recoveryWords.map((order) => (
          <Controller
            key={order}
            control={control}
            rules={{
              required: true,
              pattern: /^[a-z]+$/
            }}
            render={({ field: { value, onBlur, onChange } }) => (
              <View style={tailwind('flex-row w-full bg-white border-b border-gray-200')}>
                <Text style={tailwind('p-4 font-semibold w-20 pr-0')}>{`#${order}`}</Text>
                <TextInput
                  ref={inputRefMap[order]}
                  testID={`recover_word_${order}`}
                  style={tailwind('flex-grow p-4 pl-0')}
                  autoCapitalize='none'
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  keyboardType='default'
                  placeholder={translate('screens/SendScreen', `Enter word #${order}`)}
                  returnKeyType='next'
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    if (order < 24) {
                      inputRefMap[order + 1].current.focus()
                    } else {
                      onSubmit()
                    }
                  }}
                />
              </View>
            )}
            name={`recover_word_${order}`}
            defaultValue=''
          />
        ))
      }
      <TouchableOpacity
        onPress={onRestore}
        style={[tailwind('my-6 mx-4 rounded flex items-center justify-center bg-primary')]}
      >
        <Text style={tailwind('p-3 font-bold text-white')}>
          RESTORE
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
