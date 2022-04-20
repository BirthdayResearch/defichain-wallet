import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'
import { View } from '@components'
import { translate } from '@translations'
import { NoTokensLight } from '../assets/NoTokensLight'
import { NoTokensDark } from '../assets/NoTokensDark'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
interface EmptyBalancesProps {
  type: string
}

export function EmptyBalances (props: EmptyBalancesProps): JSX.Element {
  const { isLight } = useThemeContext()
  return (
    <ThemedView
      light={tailwind('bg-gray-50')}
      style={tailwind('px-4 mt-8 text-center')}
      testID='empty_balances'
    >
      <View style={tailwind('items-center pb-4 pr-2')}>
        {isLight ? <NoTokensLight /> : <NoTokensDark />}
      </View>
      <ThemedText testID='empty_tokens_title' style={tailwind('text-lg pb-1 font-semibold text-center')}>
        {translate('components/EmptyBalances', `No ${props.type} in portfolio`)}
      </ThemedText>
    </ThemedView>
  )
}
