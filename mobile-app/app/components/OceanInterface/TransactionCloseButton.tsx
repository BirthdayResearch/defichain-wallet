import { TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedText } from '@components/themed'
import { translate } from '@translations'

interface TransactionCloseButtonProps {
  onPress: () => void
}

export function TransactionCloseButton (props: TransactionCloseButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('px-2 ml-3 py-1 rounded border border-gray-300 rounded flex-row justify-center items-center')}
      testID='oceanInterface_close'
    >
      <ThemedText
        dark={tailwind('font-medium text-darkprimary-500')}
        light={tailwind('font-medium text-primary-500')}
        style={tailwind('text-sm ')}
      >
        {translate('screens/OceanInterface', 'OK')}
      </ThemedText>
    </TouchableOpacity>
  )
}
