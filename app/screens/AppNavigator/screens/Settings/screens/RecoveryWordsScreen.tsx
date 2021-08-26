import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { View } from '../../../../../components'
import { ThemedScrollView, ThemedText, ThemedView } from '../../../../../components/themed'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { SettingsParamList } from '../SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'RecoveryWordsScreen'>

export function RecoveryWordsScreen ({ route }: Props): JSX.Element {
  const { words } = route.params
  return (
    <ThemedScrollView testID='recovery_word_screen'>
      <ThemedText style={tailwind('pt-6 pb-4 px-4 text-sm font-medium')}>
        {translate('screens/RecoveryWordsScreen', 'Keep your recovery words safe and private')}
      </ThemedText>
      <View style={tailwind('pb-12')}>
        {words.map((word, index) => {
          return <MnemonicWordRow word={word} index={index} key={index} />
        })}
      </View>
    </ThemedScrollView>
  )
}

function MnemonicWordRow (props: {word: string, index: number}): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-white border-b border-gray-200')} dark={tailwind('bg-gray-800 border-b border-gray-700')}
      style={tailwind('flex-row px-4 py-3')}
    >
      <ThemedText testID={`word_${props.index + 1}_number`} style={tailwind('w-10')}>
        {props.index + 1}.
      </ThemedText>
      <ThemedText testID={`word_${props.index + 1}`}>
        {props.word}
      </ThemedText>
    </ThemedView>
  )
}
