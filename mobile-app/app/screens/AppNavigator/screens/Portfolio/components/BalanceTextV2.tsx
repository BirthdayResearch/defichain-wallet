import { ThemedProps, ThemedTextV2 } from '@components/themed'
import { TextProps } from '@components'

interface BalanceTextProps {
  symbol?: string
  value: string
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
