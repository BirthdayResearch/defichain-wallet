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
      style={tailwind('flex-col px-4 py-8 mb-4 justify-center items-center')}
      light='bg-white border-b border-gray-300' dark='bg-gray-800 border-b border-gray-700'
    >
      <ThemedText light='text-gray-500' dark='text-gray-400' testID='confirm_title' style={tailwind('text-xs')}>
        {title}
      </ThemedText>
      <NumberFormat
        value={amount.toFixed(8)} decimalScale={8} thousandSeparator displayType='text' suffix={suffix}
        renderText={(value) => (
          <ThemedText
            testID={testID}
            style={tailwind('text-2xl font-bold flex-wrap')}
          >{value}
          </ThemedText>
        )}
      />
    </ThemedView>
  )
}
