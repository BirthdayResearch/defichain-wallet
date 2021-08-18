import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '../tailwind'
import { getNativeIcon } from './icons/assets'
import { Text } from './Text'

export function TokenBalanceRow (props: { lhs: string, rhs: { value: string | number, testID: string }, iconType: string }): JSX.Element {
  const TokenIcon = getNativeIcon(props.iconType)
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1 flex-row')}>
        <TokenIcon style={tailwind('mr-2')} />
        <Text style={tailwind('font-medium')} testID={`${props.rhs.testID}_unit`}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        <NumberFormat
          value={props.rhs.value} decimalScale={8} thousandSeparator displayType='text'
          renderText={(val: string) => (
            <Text
              testID={props.rhs.testID}
              style={tailwind('flex-wrap font-medium text-right text-gray-500')}
            >{val}
            </Text>
          )}
        />
      </View>
    </View>
  )
}
