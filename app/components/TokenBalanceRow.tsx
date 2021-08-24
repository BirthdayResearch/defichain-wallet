import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '../tailwind'
import { getNativeIcon } from './icons/assets'
import { ThemedText, ThemedView } from './themed'

export function TokenBalanceRow (props: { lhs: string, rhs: { value: string | number, testID: string }, iconType: string }): JSX.Element {
  const TokenIcon = getNativeIcon(props.iconType)
  return (
    <ThemedView
      style={tailwind('p-4 flex-row items-center w-full')} light='bg-white border-b border-gray-200'
      dark='bg-gray-800 border-b border-gray-700'
    >
      <View style={tailwind('flex-1 flex-row items-center')}>
        <TokenIcon style={tailwind('mr-2')} />
        <ThemedText style={tailwind('font-medium')} testID={`${props.rhs.testID}_unit`}>{props.lhs}</ThemedText>
      </View>
      <View style={tailwind('flex-1')}>
        <NumberFormat
          value={props.rhs.value} decimalScale={8} thousandSeparator displayType='text'
          renderText={(val: string) => (
            <ThemedText
              light='text-gray-500'
              dark='text-white text-opacity-90'
              testID={props.rhs.testID}
              style={tailwind('flex-wrap font-medium text-right')}
            >{val}
            </ThemedText>
          )}
        />
      </View>
    </ThemedView>
  )
}
