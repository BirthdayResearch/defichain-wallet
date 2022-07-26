import { TouchableOpacity } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedTextV2 } from '@components/themed'

interface TransactionIDButtonProps {
  txid: string
  onPress?: () => void
}

export function TransactionIDButton ({ txid, onPress }: TransactionIDButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tailwind('flex-row pt-1 items-center w-8/12')}
      testID='oceanNetwork_explorer'
    >
      <ThemedTextV2
        dark={tailwind('text-mono-dark-v2-700')}
        light={tailwind('text-mono-light-v2-700')}
        ellipsizeMode='middle'
        numberOfLines={1}
        style={tailwind('text-sm font-medium-v2')}
      >
        {txid}
      </ThemedTextV2>

      <ThemedIcon
        dark={tailwind('text-mono-dark-v2-700')}
        light={tailwind('text-mono-light-v2-700')}
        iconType='Feather'
        name='external-link'
        size={16}
      />
    </TouchableOpacity>
  )
}
