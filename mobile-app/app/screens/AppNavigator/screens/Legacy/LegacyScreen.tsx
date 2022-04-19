import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'

import { StackScreenProps } from '@react-navigation/stack'
import { LegacyParamList } from './LegacyNavigator'

type Props = StackScreenProps<LegacyParamList, 'LegacyScreen'>

export function LegacyScreen ({ navigation }: Props): JSX.Element {
  return (
    <ThemedView
      testID='legacy_screen'
      style={tailwind('flex-1')}
    >
      <ThemedText>Legacy Screen</ThemedText>
    </ThemedView>
  )
}
