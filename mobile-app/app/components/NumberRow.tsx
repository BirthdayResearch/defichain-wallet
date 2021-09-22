import React from 'react'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
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
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('flex-1')}>
        <ThemedText style={tailwind('font-medium')}>
          {lhs}
        </ThemedText>
      </View>

      <View style={tailwind('flex-1 flex-col')}>
        {
          rightHandElements.map((rhs, index) => (
            <View
              key={index}
              style={tailwind('flex-1')}
            >
              <NumberFormat
                decimalScale={8}
                displayType='text'
                renderText={(val: string) => (
                  <ThemedText
                    dark={tailwind('text-gray-400')}
                    light={tailwind('text-gray-500')}
                    style={tailwind('flex-wrap font-medium text-right text-gray-500')}
                    testID={rhs.testID}
                  >
                    {val}
                  </ThemedText>
                )}
                suffix={rhs.suffix}
                thousandSeparator
                value={rhs.value}
              />
            </View>
          ))
        }
      </View>
    </ThemedView>
  )
}
