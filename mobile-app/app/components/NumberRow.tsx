import React from 'react'
import { StyleProp, TextStyle, View, ViewProps } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from './themed'

type INumberRowProps = React.PropsWithChildren<ViewProps> & NumberRowProps
type SuffixType = 'text' | 'component'
interface NumberRowProps {
  lhs: string
  rhs: NumberRowRightElement
  textStyle?: StyleProp<TextStyle>
}
interface NumberRowRightElement {
  value: string | number
  suffix?: string
  testID: string
  suffixType?: SuffixType
  prefix?: string
}

export function NumberRow (props: INumberRowProps): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-5/12')}>
        <ThemedText style={[tailwind('text-sm'), props.textStyle]} testID={`${props.rhs.testID}_label`}>
          {props.lhs}
        </ThemedText>
      </View>

      <View
        style={tailwind('flex-1 flex-row justify-end flex-wrap items-center')}
      >
        <NumberFormat
          decimalScale={8}
          displayType='text'
          prefix={props.rhs.prefix}
          renderText={(val: string) => (
            <ThemedText
              dark={tailwind('text-dfxgray-400')}
              light={tailwind('text-dfxgray-500')}
              style={[tailwind('text-sm text-right'), props.textStyle]}
              testID={props.rhs.testID}
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={props.rhs.value}
        />
        {
          props.rhs.suffixType === 'text' &&
            <ThemedText
              light={tailwind('text-dfxgray-500')}
              dark={tailwind('text-dfxgray-400')}
              style={tailwind('text-sm ml-1')}
              testID={`${props.rhs.testID}_suffix`}
            >
              {props.rhs.suffix}
            </ThemedText>
        }
        {
          props.rhs.suffixType === 'component' &&
          (props.children)
        }
      </View>
    </ThemedView>
  )
}
