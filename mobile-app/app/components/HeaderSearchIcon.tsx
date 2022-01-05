import { tailwind } from '@tailwind'
import { TouchableOpacity } from 'react-native'
import { ThemedIcon } from './themed'

export function HeaderSearchIcon (props: {onPress: () => void, testID?: string}): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('pr-4')}
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
