import { ReactElement, ReactComponentElement } from 'react'
import { ThemedTouchableListItem, ThemedTextV2 } from '@components/themed'
import { StyleProp, ViewStyle } from 'react-native'
interface PlaygroundActionProps {
  title: string
  rhsChildren?: () => ReactElement | ReactComponentElement<any>
  isLast: boolean
  testID?: string
  containerStyle?: StyleProp<ViewStyle>
  onPress?: () => void
}

export function PlaygroundAction ({ title, isLast, testID, rhsChildren, containerStyle, onPress }: PlaygroundActionProps): JSX.Element {
  return (
    <ThemedTouchableListItem isLast={isLast} testID={testID} onPress={onPress}>
      <ThemedTextV2 style={containerStyle}>
        {title}
      </ThemedTextV2>
      {rhsChildren?.()}
    </ThemedTouchableListItem>
  )
}
