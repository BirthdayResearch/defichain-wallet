import React, {} from 'react'
import { StyleSheet, Text as DefaultText, TextInput as DefaultTextInput, View as DefaultView, StyleProp, TextStyle } from 'react-native'
import NumberFormat from 'react-number-format'

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
