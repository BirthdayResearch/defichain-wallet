import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'

export function EmptyActivePoolpair (): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-900')}
      light={tailwind('bg-gray-100')}
      style={tailwind('flex items-center justify-center px-14 h-full')}
      testID='empty_active_poolpair'
    >
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='circle-off-outline'
        size={48}
        style={tailwind('mb-6')}
      />
      <ThemedText
        style={tailwind('text-2xl font-semibold text-center mb-1')}
      >{translate('screens/DexScreen', 'No active pool pairs')}
      </ThemedText>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-base text-center')}
      >{translate('screens/DexScreen', 'Supply liquidity pool tokens to earn high yields')}
      </ThemedText>
    </ThemedView>
  )
}
