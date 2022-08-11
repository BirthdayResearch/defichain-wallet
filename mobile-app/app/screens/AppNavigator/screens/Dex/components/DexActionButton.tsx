import { tailwind } from '@tailwind'
import { ThemedTextV2, ThemedTouchableOpacityV2 } from '@components/themed'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'

interface DexActionButtonProps {
  pair: PoolPairData
  label: string
  onPress: (data: PoolPairData) => void
}
export function DexActionButton ({ pair, label, onPress }: DexActionButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={tailwind('rounded-2xl-v2 py-2 px-4')}
      dark={tailwind('bg-mono-dark-v2-100')}
      light={tailwind('bg-mono-light-v2-100')}
      onPress={() => onPress(pair)}
    >
      <ThemedTextV2
        light={tailwind('text-mono-light-v2-900')}
        dark={tailwind('text-mono-dark-v2-900')}
        style={tailwind('font-semibold-v2 text-sm text-center')}
        testID='composite_swap'
      >
        {label}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  )
}
