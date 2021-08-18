import BigNumber from 'bignumber.js'
import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '../tailwind'
import { Text } from './Text'

interface SummaryTitleItems {
  title: string
  amount: BigNumber
  suffix: string
  testID: string
}

export function SummaryTitle ({ title, amount, suffix, testID }: SummaryTitleItems): JSX.Element {
  return (
    <View style={tailwind('flex-col bg-white px-4 py-8 mb-4 justify-center items-center border-b border-gray-300')}>
      <Text testID='confirm_title' style={tailwind('text-xs text-gray-500')}>
        {title}
      </Text>
      <NumberFormat
        value={amount.toFixed(8)} decimalScale={8} thousandSeparator displayType='text' suffix={suffix}
        renderText={(value) => (
          <Text
            testID={testID}
            style={tailwind('text-2xl font-bold flex-wrap')}
          >{value}
          </Text>
        )}
      />
    </View>
  )
}
