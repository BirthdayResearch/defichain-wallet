
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { ThemedProps, ThemedTextV2 } from '@components/themed'
import { TextProps, View } from '@components'
import { Platform, StyleProp, TextStyle } from 'react-native'
import { tailwind } from '@tailwind'

interface BalanceTextProps {
  symbol?: string
  value: string
  style?: StyleProp<TextStyle>
  containerStyle?: StyleProp<TextStyle>
}

export function BalanceTextV2 ({ symbol, value, style, children, containerStyle, ...otherProps }: BalanceTextProps & ThemedProps & TextProps): JSX.Element {
  const {
    isBalancesDisplayed,
    hiddenBalanceText
  } = useDisplayBalancesContext()

  return (
    <ThemedTextV2 // first layer of text component to make sure children component display inline with `value` even when it is wrapped to multi-line
      style={[tailwind('flex flex-row items-center'), containerStyle]} // for non-mobile center styling
    >
      <ThemedTextV2 // second layer of text component to target exact `value` by using testID in e2e
        style={style}
        {...otherProps}
      >
        {`${isBalancesDisplayed ? value : hiddenBalanceText} ${symbol ?? ''}`.trim()}
      </ThemedTextV2>
      {children !== undefined &&
        <View style={tailwind('pb-1', { 'pl-2': Platform.OS === 'ios' || Platform.OS === 'android' })}>
          {children}
        </View>}
    </ThemedTextV2>
  )
}
