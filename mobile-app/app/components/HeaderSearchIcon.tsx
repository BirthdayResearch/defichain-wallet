import { tailwind } from '@tailwind'
import {
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps
} from 'react-native'
import { ThemedIcon } from './themed'

interface HeaderSearchIconProps {
  onPress: () => void
  testID?: string
  style?: StyleProp<TouchableOpacityProps>
}

export function HeaderSearchIcon (props: HeaderSearchIconProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={[tailwind('pr-4'), props.style]}
      testID={props.testID}
    >
      <ThemedIcon
        light={tailwind('text-primary-500')}
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        name='search'
        size={24}
      />
    </TouchableOpacity>
  )
}
