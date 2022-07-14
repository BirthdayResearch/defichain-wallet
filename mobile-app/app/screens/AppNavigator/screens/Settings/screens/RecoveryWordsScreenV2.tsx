import { StackScreenProps } from '@react-navigation/stack'
import { ThemedScrollViewV2, ThemedViewV2, ThemedTextV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { SettingsParamList } from '../SettingsNavigatorV2'

type Props = StackScreenProps<SettingsParamList, 'RecoveryWordsScreen'>

export function RecoveryWordsScreenV2 ({ route }: Props): JSX.Element {
  const { words } = route.params
  return (
    <ThemedScrollViewV2
      contentContainerStyle={tailwind('pt-8 px-5 pb-16')}
      style={tailwind('flex-1')}
      testID='recovery_word_screen'
    >
      <ThemedTextV2 style={tailwind('font-normal-v2 text-base text-center px-5')}>
        {translate('screens/RecoveryWordsScreen', 'Take note of the correct spelling and order. Keep your recovery words confidential and secure.')}
      </ThemedTextV2>

      <ThemedViewV2
        dark={tailwind('bg-mono-dark-v2-00')}
        light={tailwind('bg-mono-light-v2-00')}
        style={tailwind('rounded-lg-v2 mt-8')}
      >
        {words.map((word, index) => {
          return (
            <RecoveryWordRow
              index={index}
              key={index}
              word={word}
              border={index < words.length - 1}
            />
          )
        })}
      </ThemedViewV2>
    </ThemedScrollViewV2>
  )
}

function RecoveryWordRow (props: { index: number, word: string, border: boolean }): JSX.Element {
  return (
    <ThemedViewV2
      dark={tailwind('border-mono-dark-v2-300')}
      light={tailwind('border-mono-light-v2-300')}
      style={tailwind(['py-4.5 mx-5 flex-row justify-center', { 'border-b-0.5': props.border }])}
    >
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-500')}
        light={tailwind('text-mono-light-v2-500')}
        style={tailwind('w-11 text-sm font-normal-v2')}
        testID={`word_${props.index + 1}_number`}
      >
        {`${props.index + 1}.`}
      </ThemedTextV2>

      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-800')}
        light={tailwind('text-mono-light-v2-800')}
        style={tailwind('flex-grow text-sm font-normal-v2')}
        testID={`word_${props.index + 1}`}
      >
        {props.word}
      </ThemedTextV2>
    </ThemedViewV2>
  )
}
