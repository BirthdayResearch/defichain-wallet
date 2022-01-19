import { StackScreenProps } from '@react-navigation/stack'
import { View } from '@components/index'
import { ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
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
          return (
            <MnemonicWordRow
              index={index}
              key={index}
              word={word}
            />
          )
        })}
      </View>
    </ThemedScrollView>
  )
}

function MnemonicWordRow (props: { word: string, index: number }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex-row px-4 py-3')}
    >
      <ThemedText
        style={tailwind('w-10')}
        testID={`word_${props.index + 1}_number`}
      >
        {props.index + 1}
        .
      </ThemedText>

      <ThemedText testID={`word_${props.index + 1}`}>
        {props.word}
      </ThemedText>
    </ThemedView>
  )
}
