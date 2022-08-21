import { tailwind } from '@tailwind'
import { ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { ViewStyle, StyleProp } from 'react-native'

interface DexActionButtonProps {
  label: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
  testID: string
}

export function DexActionButton ({ label, onPress, style, testID }: DexActionButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={[tailwind('rounded-2xl-v2 py-2 px-4'), style]}
      dark={tailwind('bg-mono-dark-v2-100')}
      light={tailwind('bg-mono-light-v2-100')}
      onPress={onPress}
    >
      <ThemedTextV2
        light={tailwind('text-mono-light-v2-900')}
        dark={tailwind('text-mono-dark-v2-900')}
        style={tailwind('font-semibold-v2 text-sm text-center')}
        testID={testID}
      >
        {label}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  )
}
