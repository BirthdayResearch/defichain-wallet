import React from 'react'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { ThemedText } from '@components/themed/ThemedText'
import { ThemedProps } from '@components/themed/index'
import { TextProps } from '@components'

interface ThemedBalanceTextProps {
  testID?: string
  symbol?: string
  value: string
}

export function ThemedBalanceText ({ symbol, testID, value, ...otherProps }: ThemedBalanceTextProps & ThemedProps & TextProps): JSX.Element {
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
