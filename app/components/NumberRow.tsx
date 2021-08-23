import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '../tailwind'
import { Text } from './Text'

interface NumberRowRightElement {
  value: string | number
  suffix?: string
  testID: string
}

export function NumberRow ({
  lhs,
  rightHandElements
}: { lhs: string, rightHandElements: NumberRowRightElement[] }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{lhs}</Text>
      </View>
      <View style={tailwind('flex-1 flex-col')}>
        {
          rightHandElements.map((rhs, index) => (
            <View key={index} style={tailwind('flex-1')}>
              <NumberFormat
                value={rhs.value} decimalScale={8} thousandSeparator displayType='text'
                suffix={rhs.suffix}
                renderText={(val: string) => (
                  <Text
                    testID={rhs.testID}
                    style={tailwind('flex-wrap font-medium text-right text-gray-500')}
                  >{val}
                  </Text>
                )}
              />
            </View>
          ))
        }
      </View>
    </View>
  )
}
