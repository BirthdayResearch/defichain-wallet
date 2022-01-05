
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { ThemedText } from '@components/themed/ThemedText'
import { ThemedProps } from '@components/themed'
import { TextProps } from '@components'

interface BalanceTextProps {
  testID?: string
  symbol?: string
  value: string
}

export function BalanceText ({ symbol, testID, value, ...otherProps }: BalanceTextProps & ThemedProps & TextProps): JSX.Element {
  const {
    isBalancesDisplayed,
    hiddenBalanceText
  } = useDisplayBalancesContext()

  return (
    <ThemedText
      testID={testID}
      {...otherProps}
    >
      {`${isBalancesDisplayed ? value : hiddenBalanceText} ${symbol ?? ''}`.trim()}
    </ThemedText>
  )
}
