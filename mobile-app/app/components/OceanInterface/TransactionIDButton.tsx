import { TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText } from '@components/themed'

interface TransactionIDButtonProps {
  txid: string
  onPress?: () => void
}

export function TransactionIDButton ({ txid, onPress }: TransactionIDButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tailwind('flex-row pt-1 items-center max-w-full')}
      testID='oceanNetwork_explorer'
    >
      <ThemedText
        dark={tailwind('text-darkprimary-500')}
        ellipsizeMode='tail'
        light={tailwind('text-primary-500')}
        numberOfLines={1}
        style={tailwind('text-sm font-medium mr-1')}
      >
        {txid}
      </ThemedText>

      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name='open-in-new'
        size={18}
      />
    </TouchableOpacity>
  )
}
