import React from 'react'
import {
  StyleSheet,
  Text as DefaultText,
  TextInput as DefaultTextInput,
  View as DefaultView,
  StyleProp,
  TextStyle,
  TouchableOpacity, ButtonProps
} from 'react-native'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { DisabledColorStyle, PrimaryColorStyle } from '../constants/Theme'

const Default = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '600'
  }
})

export function Text (props: DefaultText['props']): JSX.Element {
  const { style, ...otherProps } = props

  return <DefaultText style={[Default.text, style]} {...otherProps} />
}

export function View (props: DefaultView['props']): JSX.Element {
  const { style, ...otherProps } = props

  return <DefaultView style={[style]} {...otherProps} />
}

export function TextInput (props: DefaultTextInput['props']): JSX.Element {
  const { style, ...otherProps } = props

  return <DefaultTextInput style={[Default.text, style]} {...otherProps} />
}

export function NumberText (props: { value: string, decimal?: number, style?: StyleProp<TextStyle> }): JSX.Element {
  return (
    <NumberFormat
      value={props.value.toString()} decimalScale={props.decimal ?? 8} thousandSeparator displayType='text'
      renderText={(value) => <Text style={props.style}>{value}</Text>}
    />
  )
}

export function PrimaryButton (props: React.PropsWithChildren<ButtonProps>): JSX.Element {
  return (
    <TouchableOpacity
      disabled={props.disabled}
      onPress={props.onPress}
      style={[tailwind('m-4 mt-8 p-3 rounded flex-row justify-center'), props.disabled === true ? DisabledColorStyle.button : PrimaryColorStyle.button]}
    >
      {
        props.children
      }
    </TouchableOpacity>
  )
}
