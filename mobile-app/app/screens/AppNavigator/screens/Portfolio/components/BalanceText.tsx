
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { ThemedText } from '@components/themed/ThemedText'
import { ThemedProps, ThemedTextV2 } from '@components/themed'
import { TextProps } from '@components'

interface BalanceTextProps {
  symbol?: string
  value: string
}

export function BalanceText ({ symbol, value, ...otherProps }: BalanceTextProps & ThemedProps & TextProps): JSX.Element {
  const {
    isBalancesDisplayed,
    hiddenBalanceText
  } = useDisplayBalancesContext()

  return (
    <ThemedText
      {...otherProps}
    >
      {`${isBalancesDisplayed ? value : hiddenBalanceText} ${symbol ?? ''}`.trim()}
    </ThemedText>
  )
}
export function BalanceTextV2 ({ symbol, value, ...otherProps }: BalanceTextProps & ThemedProps & TextProps): JSX.Element {
  return (
    <ThemedTextV2
      {...otherProps}
    >
      {value}
    </ThemedTextV2>
  )
}
