import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { ScrollView } from 'react-native'
import { MnemonicUnprotected } from '../../../../api/wallet'
import { Text, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { CREATE_STEPS, CreateWalletStepIndicator } from '../../../../components/CreateWalletStepIndicator'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { WalletParamList } from '../../WalletNavigator'

type Props = StackScreenProps<WalletParamList, 'CreateMnemonicWallet'>

export function CreateMnemonicWallet ({ navigation }: Props): JSX.Element {
  const words = MnemonicUnprotected.generateWords()

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
    <ScrollView style={tailwind('flex-1 bg-white')}>
      <CreateWalletStepIndicator
        current={1}
        steps={CREATE_STEPS}
        style={tailwind('py-4 px-1')}
      />
      <Text style={tailwind('font-semibold text-base p-4 text-center')}>
        {translate('screens/CreateMnemonicWallet', 'Take note of the words in their correct order')}
      </Text>
      {words.map((word, index) => {
        return <RecoveryWordRow word={word} index={index} key={index} />
      })}
      <Button
        title='verify button' onPress={onContinue} testID='verify_button'
        label={translate('screens/CreateMnemonicWallet', 'VERIFY WORDS')}
      />
    </ScrollView>
  )
}

function RecoveryWordRow (props: { index: number, word: string }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 flex-row border-b border-gray-200')}>
      <Text testID={`word_${props.index + 1}_number`} style={[tailwind('w-12 font-semibold')]}>
        {`${props.index + 1}.`}
      </Text>
      <Text testID={`word_${props.index + 1}`} style={tailwind('flex-grow font-semibold')}>
        {props.word}
      </Text>
    </View>
  )
}
