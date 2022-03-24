import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'
import { View } from '@components'
import { translate } from '@translations'
import { EmptyWalletLight } from '../assets/EmptyWalletLight'
import { EmptyWalletDark } from '../assets/EmptyWalletDark'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export function EmptyPortfolio (): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      light={tailwind('bg-gray-50')}
      style={tailwind('px-8 mt-8 pb-2 text-center')}
      testID='empty_portfolio'
    >
      <View style={tailwind('items-center pb-4')}>
        {
          isLight ? <EmptyWalletLight /> : <EmptyWalletDark />
        }
      </View>
      <ThemedText testID='empty_tokens_title' style={tailwind('text-lg pb-1 font-semibold text-center')}>
        {translate('components/EmptyPortfolio', 'Empty portfolio')}
      </ThemedText>
      <ThemedText testID='empty_tokens_subtitle' style={tailwind('text-sm px-8 pb-4 text-center opacity-60')}>
        {translate('components/EmptyPortfolio', 'Add your DFI and other tokens to get started')}
      </ThemedText>
    </ThemedView>
  )
}
