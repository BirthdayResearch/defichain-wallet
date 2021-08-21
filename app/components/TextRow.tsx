import React from 'react'
import { View } from 'react-native'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export function TextRow (props: { lhs: string, rhs: { value: string, testID: string } }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        <Text
          testID={props.rhs.testID}
          style={tailwind('font-medium text-right text-gray-500')}
        >{props.rhs.value}
        </Text>
      </View>
    </View>
  )
}
