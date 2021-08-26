import * as React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native'
import { tailwind } from '../tailwind'

interface IconButtonProps {
  testID: string
  onPress: () => void
  materialIconName: React.ComponentProps<typeof MaterialIcons>['name']
  iconSize: number
  style?: StyleProp<ViewStyle>
}

export function IconButton (props: IconButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      style={[tailwind('border border-gray-300 rounded bg-white p-1'), props.style]}
      onPress={props.onPress}
      testID={props.testID}
    >
      <MaterialIcons name={props.materialIconName} size={props.iconSize} style={tailwind('text-primary')} />
    </TouchableOpacity>
  )
}
