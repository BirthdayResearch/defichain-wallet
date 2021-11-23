import React from 'react'
import { StyleProp, TextStyle, View, ViewProps } from 'react-native'
import NumberFormat from 'react-number-format'
import { tailwind } from '@tailwind'
import { ThemedProps, ThemedText, ThemedView } from './themed'

type INumberRowProps = React.PropsWithChildren<ViewProps> & NumberRowProps
export type SuffixType = 'text' | 'component'

interface NumberRowProps extends ThemedProps {
  lhs: string
  rhs: NumberRowElement
  textStyle?: StyleProp<TextStyle>
  lhsThemedProps?: ThemedProps // TODO: change lhs to type NumberRowElement, move themedprops into NumberRowElement
  rhsThemedProps?: ThemedProps
}

export interface NumberRowElement {
  value: string | number
  suffix?: string
  testID: string
  suffixType?: SuffixType
  prefix?: string
  style?: StyleProp<ViewProps>
}

export function NumberRow (props: INumberRowProps): JSX.Element {
  return (
    <ThemedView
      dark={props.dark ?? tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={props.light ?? tailwind('bg-white border-b border-gray-200')}
      style={props.style ?? tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-6/12')}>
        <ThemedText
          style={[tailwind('text-sm'), props.textStyle]}
          testID={`${props.rhs.testID}_label`}
          {...props.lhsThemedProps}
        >
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
              style={[tailwind('text-sm text-right'), props.textStyle, props.rhs.style]}
              testID={props.rhs.testID}
              {...props.rhsThemedProps}
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
              style={[tailwind('text-sm ml-1'), props.textStyle, props.rhs.style]}
              testID={`${props.rhs.testID}_suffix`}
              {...props.rhsThemedProps}
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
