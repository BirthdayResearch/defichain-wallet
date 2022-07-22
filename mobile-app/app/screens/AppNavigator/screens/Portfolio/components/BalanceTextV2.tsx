
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { ThemedProps, ThemedTextV2 } from '@components/themed'
import { TextProps, View } from '@components'
import { StyleProp, TextStyle } from 'react-native'
import { tailwind } from '@tailwind'

interface BalanceTextProps {
  symbol?: string
  value: string
  style?: StyleProp<TextStyle>
}

export function BalanceTextV2 ({ symbol, value, style, children, ...otherProps }: BalanceTextProps & ThemedProps & TextProps): JSX.Element {
  const {
    isBalancesDisplayed,
    hiddenBalanceText
  } = useDisplayBalancesContext()

  return (
    <ThemedTextV2
      style={style}
      {...otherProps}
    >
      {`${isBalancesDisplayed ? value : hiddenBalanceText} ${symbol ?? ''}`.trim()}
      <View style={tailwind('pl-2 pb-1')}>
        {children}
      </View>
    </ThemedTextV2>
  )
}
