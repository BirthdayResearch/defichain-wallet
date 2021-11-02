import { View } from '@components'
import { tailwind } from '@tailwind'
import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText } from './themed'
import { SymbolIcon } from '@screens/AppNavigator/screens/Loans/components/SymbolIcon'

interface TokenIconGroupProps {
  symbols: string[]
  maxDisplay: number
}

export function TokenIconGroup (props: TokenIconGroupProps): JSX.Element {
  const additionalIcon = BigNumber.max(props.symbols.length - props.maxDisplay, 0)
  return (
    <View style={tailwind('flex flex-row')}>
      {
        props.symbols.map((symbol, index): JSX.Element | null => {
          if (index < props.maxDisplay) {
            return (
              <View key={symbol} style={[tailwind('bg-white rounded-full p-px relative'), { left: index * -5 }]}>
                <SymbolIcon
                  key={symbol}
                  symbol={symbol}
                />
              </View>
            )
          }
          return null
        })
      }
      {additionalIcon.gt(0) &&
        (
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={[tailwind('relative text-xs font-medium'), { left: (props.maxDisplay - 2) * -5 }]}
          >
            & {additionalIcon.toFixed()} more
          </ThemedText>
        )}
    </View>

  )
}
