import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedTextV2, ThemedIcon, ThemedTouchableOpacityV2 } from '@components/themed'
import { PoolPairTextSectionV2 } from './PoolPairCards/PoolPairTextSectionV2'

interface ViewPoolHeaderProps {
    tokenASymbol: string
    tokenBSymbol: string
    headerLabel: string
    onPress: () => void
}

export function ViewPoolHeader ({ tokenASymbol, tokenBSymbol, headerLabel, onPress }: ViewPoolHeaderProps): JSX.Element {
    return (
      <View style={tailwind('items-center my-8')}>
        <View>
          <PoolPairTextSectionV2
            symbolA={tokenASymbol}
            symbolB={tokenBSymbol}
            customSize={56}
          />
        </View>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          style={tailwind('mt-2 text-lg font-semibold-v2')}
        >
          {`${tokenASymbol}-${tokenBSymbol}`}
        </ThemedTextV2>
        <ThemedTouchableOpacityV2 style={tailwind('flex-row')} onPress={onPress}>
          <ThemedIcon
            size={16}
            name='info-outline'
            iconType='MaterialIcons'
            dark={tailwind('text-mono-dark-v2-700')}
            light={tailwind('text-mono-light-v2-700')}
          />
          <ThemedTextV2
            dark={tailwind('text-mono-dark-v2-700')}
            light={tailwind('text-mono-light-v2-700')}
            style={tailwind('ml-1 text-xs font-semibold-v2')}
          >
            {headerLabel}
          </ThemedTextV2>
        </ThemedTouchableOpacityV2>
      </View>
    )
}
