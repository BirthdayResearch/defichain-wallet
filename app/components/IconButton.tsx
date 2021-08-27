import * as React from 'react'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacityProps } from 'react-native'
import { tailwind } from '../tailwind'
import { ThemedIcon, ThemedTouchableOpacity } from './themed'

type IconType = 'MaterialCommunityIcons' | 'MaterialIcons'
interface IconButtonProps extends TouchableOpacityProps {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name']
  iconType: IconType
  iconSize: number
}

export function IconButton (props: IconButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      light={tailwind('border border-gray-300 rounded bg-white')}
      dark={tailwind('border border-gray-400 rounded bg-gray-900')}
      style={[tailwind('p-1'), props.style]}
      onPress={props.onPress}
      testID={props.testID}
    >
      <ThemedIcon
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        iconType={props.iconType}
        name={props.iconName}
        size={props.iconSize}
      />
    </ThemedTouchableOpacity>
  )
}
