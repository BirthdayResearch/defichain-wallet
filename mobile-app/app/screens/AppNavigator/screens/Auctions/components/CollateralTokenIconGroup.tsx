import { View } from '@components'
import { tailwind } from '@tailwind'
import React from 'react'
import BigNumber from 'bignumber.js'
import { SymbolIcon } from '@components/SymbolIcon'
import { ThemedText, ThemedView } from '@components/themed'

interface Props {
  title?: string
  symbols: string[]
  maxIconToDisplay: number
}

export function CollateralTokenIconGroup (props: Props): JSX.Element {
  const { symbols, maxIconToDisplay, title } = props
  const additionalIcon = BigNumber.max(symbols?.length - maxIconToDisplay, 0)

  return (
    <ThemedView
      light={tailwind('border-gray-300 bg-white')}
      dark={tailwind('border-gray-400 bg-gray-900')}
      style={tailwind('flex flex-row py-1 px-2 border rounded')}
    >
      {title !== undefined && (
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('mr-1 text-xs text-center')}
        >
          {title}
        </ThemedText>
     )}
      {
        symbols?.map((symbol, index): JSX.Element | null => {
          if (index < maxIconToDisplay) {
            return (
              <View key={symbol} style={tailwind('rounded-full p-px')}>
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
          <View style={tailwind('p-px')}>
            <ThemedView
              light={tailwind('bg-gray-700 border-white')}
              dark={tailwind('bg-gray-700 border-gray-800')}
              style={tailwind('rounded-full h-4 w-4 flex justify-center items-center')}
            >
              <ThemedText
                testID='collateral_token_count_badge'
                light={tailwind('text-white text-opacity-90')}
                dark={tailwind('text-white text-opacity-90')}
                style={tailwind('text-xs text-center')}
              >
                {additionalIcon.gt(9) ? '+9' : `+${additionalIcon.toNumber()}`}
              </ThemedText>
            </ThemedView>
          </View>
        )}
    </ThemedView>
  )
}
