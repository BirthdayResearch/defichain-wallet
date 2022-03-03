import { ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { RandomAvatar } from './RandomAvatar'

interface WalletSelectionButtonProps {
  address: string
}

export function WalletSelectionButton (props: WalletSelectionButtonProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-gray-50')}
      dark={tailwind('bg-gray-800')}
      style={tailwind('rounded-2xl p-1 flex flex-row')}
    >
      <RandomAvatar name={props.address} size={18} />
      <ThemedText
        ellipsizeMode='middle'
        numberOfLines={1}
        style={tailwind('text-xs w-14')}
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
      >
        {props.address}
      </ThemedText>
    </ThemedView>
  )
}
