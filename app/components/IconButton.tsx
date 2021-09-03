import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import * as React from 'react'
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
      dark={tailwind('border border-gray-400 rounded bg-gray-900')}
      light={tailwind('border border-gray-300 rounded bg-white')}
      onPress={props.onPress}
      style={[tailwind('p-1'), props.style]}
      testID={props.testID}
    >
      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType={props.iconType}
        light={tailwind('text-primary-500')}
        name={props.iconName}
        size={props.iconSize}
      />
    </ThemedTouchableOpacity>
  )
}
