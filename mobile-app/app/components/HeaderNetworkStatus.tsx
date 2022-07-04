import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { RootState } from '@store'
import { tailwind } from '@tailwind'
import { TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'
import { NetworkIcon } from './icons/assets/NetworkIcon'
import { ThemedText } from './themed'

export function HeaderNetworkStatus ({ onPress }: { onPress: () => void }): JSX.Element {
  const { network } = useNetworkContext()
  const { connected } = useSelector((state: RootState) => state.block)

  return (
    <TouchableOpacity onPress={onPress} style={tailwind('items-center justify-center')} testID='header_active_network'>
      <NetworkIcon pathColor={connected ? '#00AD1D' : '#E54545'} />
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
