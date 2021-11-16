import React from 'react'
import { StyleProp, TextStyle, View } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'

interface TextRowProps {
  lhs: string
  rhs: {
    value: string
    testID: string
    themedProps?: ThemedProps
  }
  textStyle?: StyleProp<TextStyle>
}

export function TextRow (props: TextRowProps): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-5/12')}>
        <ThemedText style={[tailwind('font-medium'), props.textStyle]}>
          {props.lhs}
        </ThemedText>
      </View>

      <View style={tailwind('flex-1')}>
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          {...props.rhs.themedProps}
          style={[tailwind('font-medium text-right'), props.textStyle]}
          testID={props.rhs.testID}
        >
          {props.rhs.value}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
