import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { tailwind } from '@tailwind'
import { TouchableOpacity } from 'react-native'
import { NetworkIcon } from './icons/assets/NetworkIcon'
import { ThemedText } from './themed'

export function HeaderNetworkStatus ({ onPress }: { onPress: () => void }): JSX.Element {
  const { network } = useNetworkContext()

  return (
    <TouchableOpacity onPress={onPress} style={tailwind('items-center justify-center pt-2')}>
      <NetworkIcon />
      <ThemedText
        style={[tailwind('font-bold-v2 text-2xs'), { lineHeight: 12 }]}
        light={tailwind('text-mono-light-v2-900')}
        dark={tailwind('text-mono-dark-v2-900')}
      >
        {network}
      </ThemedText>
    </TouchableOpacity>
  )
}
