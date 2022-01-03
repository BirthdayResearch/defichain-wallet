
import { View } from 'react-native'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'

interface PlaygroundActionProps {
  testID: string
  title: string
  onPress: () => void
}

export function PlaygroundAction (props: PlaygroundActionProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={props.onPress}
      style={tailwind('flex-row items-center justify-between p-4 bg-white border-b border-gray-100')}
      testID={props.testID}
    >
      <ThemedText style={tailwind('flex-1 font-medium')}>
        {props.title}
      </ThemedText>

      <View style={tailwind('px-4')} />

      <ThemedIcon
        iconType='MaterialIcons'
        name='chevron-right'
        size={24}
      />
    </ThemedTouchableOpacity>
  )
}
