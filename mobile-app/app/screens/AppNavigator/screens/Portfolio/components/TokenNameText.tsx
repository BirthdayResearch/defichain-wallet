import { tailwind } from '@tailwind'
import { ThemedText } from '@components/themed'
import { View } from '@components'

export function TokenNameText ({
  testID,
  displaySymbol,
  name
}: { testID: string, displaySymbol: string, name: string }): JSX.Element {
  return (
    <View style={tailwind('mx-3 flex-auto')}>
      <ThemedText
        dark={tailwind('text-gray-200')}
        light={tailwind('text-black')}
        style={tailwind('font-medium')}
        testID={`${testID}_symbol`}
      >
        {displaySymbol}
      </ThemedText>
      <ThemedText
        dark={tailwind('text-gray-400')}
        ellipsizeMode='tail'
        light={tailwind('text-gray-600')}
        numberOfLines={1}
        style={tailwind('text-xs text-gray-600')}
        testID={`${testID}_name`}
      >
        {name}
      </ThemedText>
    </View>
  )
}
