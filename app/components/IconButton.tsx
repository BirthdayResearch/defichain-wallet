import * as React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { tailwind } from '../tailwind'
import { StyleProp, ViewStyle } from 'react-native'

interface IconButtonProps {
  testID: string
  onPress: () => void
  materialIconName: React.ComponentProps<typeof MaterialIcons>['name']
  size: number
  style?: StyleProp<ViewStyle>
}

export function IconButton (props: IconButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      style={[tailwind('border border-gray-300 rounded bg-white p-1'), props.style]}
      onPress={props.onPress}
      testID={props.testID}
    >
      <MaterialIcons name={props.materialIconName} size={props.size} style={tailwind('text-primary')} />
    </TouchableOpacity>
  )
}
