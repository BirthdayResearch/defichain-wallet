import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'
import { View } from '@components'
import { translate } from '@translations'
import { EmptyWalletLight } from '../assets/EmptyWalletLight'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { DfxEmptyWalletImage } from '../assets/DfxEmptyWalletImage'
import { DfxEmptyWallet } from './DfxEmptyWallet'

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
          isLight ? <EmptyWalletLight /> : <DfxEmptyWalletImage />
        }
      </View>
      <ThemedText testID='empty_tokens_title' style={tailwind('text-lg pb-1 font-semibold text-center')}>
        {translate('components/EmptyPortfolio', 'Empty portfolio')}
      </ThemedText>
      <DfxEmptyWallet />
    </ThemedView>
  )
}
