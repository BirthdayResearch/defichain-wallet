import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '../tailwind'
import { ThemedText, ThemedView } from './themed'

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
    <ThemedView
      style={tailwind('p-4 flex-row items-start w-full')} light='bg-white border-b border-gray-200'
      dark='bg-darksurface border-b border-dark'
    >
      <View style={tailwind('flex-1')}>
        <ThemedText style={tailwind('font-medium')}>{lhs}</ThemedText>
      </View>
      <View style={tailwind('flex-1 flex-col')}>
        {
          rightHandElements.map((rhs, index) => (
            <View key={index} style={tailwind('flex-1')}>
              <NumberFormat
                value={rhs.value} decimalScale={8} thousandSeparator displayType='text'
                suffix={rhs.suffix}
                renderText={(val: string) => (
                  <ThemedText
                    testID={rhs.testID}
                    light='text-gray-500'
                    dark='text-white text-opacity-90'
                    style={tailwind('flex-wrap font-medium text-right text-gray-500')}
                  >{val}
                  </ThemedText>
                )}
              />
            </View>
          ))
        }
      </View>
    </ThemedView>
  )
}
