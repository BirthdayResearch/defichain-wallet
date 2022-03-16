import { tailwind } from '@tailwind'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { translate } from '@translations'

export function EmptyBalances (): JSX.Element {
  return (
    <ThemedView
      style={tailwind('px-8 mt-8 pb-2 text-center')}
      testID='empty_balances'
    >
      <ThemedIcon
        light={tailwind('text-black')}
        dark={tailwind('text-white')}
        iconType='MaterialCommunityIcons'
        name='circle-off-outline'
        size={32}
        style={tailwind('pb-2 text-center')}
      />

      <ThemedText testID='empty_tokens_title' style={tailwind('text-lg pb-1 font-semibold text-center')}>
        {translate('components/EmptyBalances', 'No other tokens yet')}
      </ThemedText>

      <ThemedText testID='empty_tokens_subtitle' style={tailwind('text-sm px-8 pb-4 text-center opacity-60')}>
        {translate('components/EmptyBalances', 'Get started by adding your tokens here in your wallet')}
      </ThemedText>
    </ThemedView>
  )
}
