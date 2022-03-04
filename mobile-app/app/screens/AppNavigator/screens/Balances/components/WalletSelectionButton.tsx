import { ThemedText, ThemedTouchableOpacity } from '@components/themed'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'

interface WalletSelectionButtonProps {
  address: string
  onPress: () => void
}

export function WalletSelectionButton (props: WalletSelectionButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacity
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-900')}
      style={tailwind('rounded-2xl p-1 flex flex-row items-center mr-2')}
      onPress={props.onPress}
    >
      <RandomAvatar name={props.address} size={24} />
      <ThemedText
        ellipsizeMode='middle'
        numberOfLines={1}
        style={tailwind('text-xs w-14 ml-1')}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
      >
        {props.address}
      </ThemedText>
    </ThemedTouchableOpacity>
  )
}
