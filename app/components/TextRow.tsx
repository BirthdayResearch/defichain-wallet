import React from 'react'
import { View } from 'react-native'
import { tailwind } from '../tailwind'
import { ThemedText, ThemedView } from './themed'

export function TextRow (props: { lhs: string, rhs: { value: string, testID: string } }): JSX.Element {
  return (
    <ThemedView
      style={tailwind('p-4 flex-row items-start w-full')} light={tailwind('bg-white border-b border-gray-200')}
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
    >
      <View style={tailwind('flex-1')}>
        <ThemedText style={tailwind('font-medium')}>{props.lhs}</ThemedText>
      </View>
      <View style={tailwind('flex-1')}>
        <ThemedText
          testID={props.rhs.testID}
          light={tailwind('text-gray-500')} dark={tailwind('text-gray-400')}
          style={tailwind('font-medium text-right')}
        >{props.rhs.value}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
