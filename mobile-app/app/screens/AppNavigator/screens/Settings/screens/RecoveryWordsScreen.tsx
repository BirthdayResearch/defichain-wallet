import { StackScreenProps } from '@react-navigation/stack'
import { View } from '@components/index'
import { ThemedScrollView, ThemedText, ThemedView, ThemedIcon } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsParamList } from '../SettingsNavigator'

type Props = StackScreenProps<SettingsParamList, 'RecoveryWordsScreen'>

export function RecoveryWordsScreen ({ route }: Props): JSX.Element {
  const { words } = route.params
  return (
    <ThemedScrollView testID='recovery_word_screen'>
      <View style={tailwind('p-4')}>
        <ThemedView
          light={tailwind('bg-warning-100')}
          dark={tailwind('bg-darkwarning-100')}
          style={tailwind('flex flex-row p-2 text-sm font-medium rounded items-center')}
        >
          <ThemedIcon
            dark={tailwind('text-yellow-300')}
            light={tailwind('text-yellow-500')}
            style={tailwind('pr-1')}
            iconType='MaterialIcons'
            name='lock'
            size={15}
          />
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-white')}
            style={tailwind('text-sm')}
          >
            {translate('screens/RecoveryWordsScreen', 'Keep your recovery words safe and private.')}
          </ThemedText>
        </ThemedView>
      </View>

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
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
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
