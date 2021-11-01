import { View } from '@components'
import { tailwind } from '@tailwind'
import React from 'react'
import BigNumber from 'bignumber.js'
import { ThemedText } from './themed'
import { Collateral } from './VaultCard'
import { SymbolIcon } from '@screens/AppNavigator/screens/Loans/components/SymbolIcon'

export function TokenIconGroup (props: {symbols: Collateral[]}): JSX.Element {
  const additionalIcon = BigNumber.max(props.symbols.length - 3, 0)
  return (
    <View style={tailwind('flex flex-row mx-1')}>
      {
        props.symbols.map((symbol, index): JSX.Element | null => {
          if (index <= 2) {
            return (
              <View key={symbol.id} style={[tailwind('bg-white rounded-full p-px relative'), { left: index * -9 }]}>
                <SymbolIcon
                  key={symbol.id}
                  symbol={symbol.id}
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
            style={tailwind('relative -left-3.5 text-xs font-medium')}
          >
            & {additionalIcon.toFixed()} more
          </ThemedText>
        )}
    </View>

  )
}
