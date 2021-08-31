import BigNumber from 'bignumber.js'
import React from 'react'
import NumberFormat from 'react-number-format'
import { tailwind } from '../tailwind'
import { ThemedText, ThemedView } from './themed'

interface SummaryTitleItems {
  title: string
  amount: BigNumber
  suffix: string
  testID: string
}

export function SummaryTitle ({ title, amount, suffix, testID }: SummaryTitleItems): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-blue-800 border-b border-blue-900')}
      light={tailwind('bg-white border-b border-gray-300')}
      style={tailwind('flex-col px-4 py-8 mb-4 justify-center items-center')}
    >
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs')}
        testID='confirm_title'
      >
        {title}
      </ThemedText>

      <NumberFormat
        decimalScale={8}
        displayType='text'
        renderText={(value) => (
          <ThemedText
            style={tailwind('text-2xl font-bold flex-wrap')}
            testID={testID}
          >
            {value}
          </ThemedText>
        )}
        suffix={suffix}
        thousandSeparator
        value={amount.toFixed(8)}
      />
    </ThemedView>
  )
}
