import React from 'react'
import { TextInput as DefaultTextInput, View as DefaultView } from 'react-native'
import { Default, Text as DefaultText, TextProps } from './Text'

export function Text (props: TextProps): JSX.Element {
  return <DefaultText {...props} />
}

export function View (props: DefaultView['props']): JSX.Element {
  const { style, ...otherProps } = props

  return <DefaultView style={[style]} {...otherProps} />
}

export function TextInput (props: DefaultTextInput['props']): JSX.Element {
  const { style, ...otherProps } = props

  return <DefaultTextInput style={[Default.text, style]} {...otherProps} />
}
