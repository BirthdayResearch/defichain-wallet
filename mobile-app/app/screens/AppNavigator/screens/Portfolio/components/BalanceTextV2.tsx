
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { ThemedProps, ThemedTextV2 } from '@components/themed'
import { TextProps } from '@components'

interface BalanceTextProps {
  symbol?: string
  value: string
}

export function BalanceTextV2 ({ symbol, value, ...otherProps }: BalanceTextProps & ThemedProps & TextProps): JSX.Element {
  const {
    isBalancesDisplayed,
    hiddenBalanceText
  } = useDisplayBalancesContext()

  return (
    <ThemedTextV2
      {...otherProps}
    >
      {`${isBalancesDisplayed ? value : hiddenBalanceText} ${symbol ?? ''}`.trim()}
    </ThemedTextV2>
  )
}
