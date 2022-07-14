import { ThemedIcon, ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

interface LearnMoreCTAProps {
  onPress: () => void
  testId?: string
}

export function LearnMoreCTA ({ onPress, testId }: LearnMoreCTAProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={tailwind('mt-2 flex-row items-center justify-center border-b-0')}
      onPress={onPress}
      testID={testId}
    >
      <ThemedIcon
        light={tailwind('text-mono-light-v2-900')}
        dark={tailwind('text-mono-dark-v2-900')}
        iconType='MaterialIcons'
        name='help'
        size={16}
      />
      <ThemedTextV2
        style={tailwind('pl-1.5 text-sm text-center font-semibold-v2')}
      >
        {translate('screens/Guidelines', 'Learn more')}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  )
}
