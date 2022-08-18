import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { ViewStyle, StyleProp } from 'react-native'

interface DexActionButtonProps {
  pair: PoolPairData
  label: string
  onPress: (data: PoolPairData) => void
  style?: StyleProp<ViewStyle>
  testID: string
}

export function DexActionButton ({ pair, label, onPress, style, testID }: DexActionButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={[tailwind('rounded-2xl-v2 py-2 px-4'), style]}
      dark={tailwind('bg-mono-dark-v2-100')}
      light={tailwind('bg-mono-light-v2-100')}
      onPress={() => onPress(pair)}
    >
      <ThemedTextV2
        light={tailwind('text-mono-light-v2-900')}
        dark={tailwind('text-mono-dark-v2-900')}
        style={tailwind('font-semibold-v2 text-sm text-center')}
        testID={testID}
      >
        {label}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  )
}

interface DexAddRemoveLiquidityButtonProps {
  style?: StyleProp<ViewStyle>
  onAdd: (data: PoolPairData) => void
  onRemove: (data: PoolPairData) => void
  pair: PoolPairData
}

export function DexAddRemoveLiquidityButton ({ style, onAdd, onRemove, pair }: DexAddRemoveLiquidityButtonProps): JSX.Element {
  return (
    <ThemedViewV2
      style={[tailwind('rounded-2xl-v2 py-2 px-3 flex flex-row items-center'), style]}
      dark={tailwind('bg-mono-dark-v2-100')}
      light={tailwind('bg-mono-light-v2-100')}

    >
      <ThemedTouchableOpacityV2
        onPress={() => onRemove(pair)}
        style={tailwind('border-b-0 border-r-0.5 pr-2')}
      >
        <ThemedIcon
          iconType='Feather'
          name='minus-circle'
          size={20}
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
        />
      </ThemedTouchableOpacityV2>
      <ThemedTouchableOpacityV2
        onPress={() => onAdd(pair)}
        style={tailwind('border-b-0 pl-2')}
      >
        <ThemedIcon
          iconType='Feather'
          name='plus-circle'
          size={20}
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
        />
      </ThemedTouchableOpacityV2>
    </ThemedViewV2>
  )
}
