import { TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedIcon } from '@components/themed'

interface TransactionCloseButtonProps {
  onPress: () => void
}

export function TransactionCloseButton (props: TransactionCloseButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      testID='oceanInterface_close'
    >
      <ThemedIcon
        light={tailwind('text-mono-light-v2-700')}
        dark={tailwind('text-mono-dark-v2-700')}
        style={tailwind('font-bold-v2 px-5 py-6')}
        iconType='MaterialIcons'
        name='close'
        size={18}
      />
    </TouchableOpacity>
  )
}
