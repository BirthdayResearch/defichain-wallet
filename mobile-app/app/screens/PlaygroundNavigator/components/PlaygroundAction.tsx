import { ThemedTouchableListItem, ThemedTextV2 } from '@components/themed'
import { StyleProp, TextStyle } from 'react-native'
import { tailwind } from '@tailwind'
interface PlaygroundActionProps {
  title: string
  rhsChildren?: () => JSX.Element
  isLast: boolean
  testID?: string
  textStyle?: StyleProp<TextStyle>
  onPress?: () => void
}

export function PlaygroundAction ({ title, isLast, testID, rhsChildren, textStyle, onPress }: PlaygroundActionProps): JSX.Element {
  return (
    <ThemedTouchableListItem isLast={isLast} testId={testID} onPress={onPress}>
      <ThemedTextV2 style={[tailwind('text-sm font-normal-v2'), textStyle]}>
        {title}
      </ThemedTextV2>
      {rhsChildren?.()}
    </ThemedTouchableListItem>
  )
}
