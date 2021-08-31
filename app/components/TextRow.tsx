import React from 'react'
import { View } from 'react-native'
import { tailwind } from '../tailwind'
import { ThemedText, ThemedView } from './themed'

export function TextRow (props: { lhs: string, rhs: { value: string, testID: string } }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-blue-800 border-b border-blue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('flex-1')}>
        <ThemedText style={tailwind('font-medium')}>
          {props.lhs}
        </ThemedText>
      </View>

      <View style={tailwind('flex-1')}>
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={tailwind('font-medium text-right')}
          testID={props.rhs.testID}
        >
          {props.rhs.value}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
