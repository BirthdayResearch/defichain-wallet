import { tailwind } from '@tailwind'
import React from 'react'
import { ThemedView, ThemedText } from '@components/themed'
import NumberFormat from 'react-number-format'
import { StyleProp } from 'react-native'
import { TextProps } from '@components'

interface InputHelperTextProps {
  testID?: string
  label: string
  content: string
  suffix: string
  styleProps?: StyleProp<TextProps>
}
export function InputHelperText (props: InputHelperTextProps): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-transparent')}
      dark={tailwind('bg-transparent')}
      style={tailwind('flex-1 flex-row flex-wrap mt-1 mb-4 text-sm')}
    >
      <ThemedText
        light={tailwind('text-gray-400')}
        dark={tailwind('text-gray-500')}
        style={tailwind('text-sm')}
      >
        {`${props.label}`}
      </ThemedText>

      <NumberFormat
        decimalScale={8}
        displayType='text'
        renderText={(value) => (
          <ThemedText
            light={tailwind('text-gray-700')}
            dark={tailwind('text-gray-200')}
            style={[tailwind('text-sm'), props.styleProps]}
            testID={props.testID}
          >
            {value}
          </ThemedText>
          )}
        suffix={props.suffix}
        thousandSeparator
        value={props.content}
      />
    </ThemedView>
  )
}
