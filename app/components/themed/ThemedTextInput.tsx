import { useThemeContext } from '@contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import React from 'react'
import { TextInput } from 'react-native'
import { ThemedProps } from './index'

type ThemedTextInputProps = TextInput['props'] & ThemedProps

export function ThemedTextInput (props: ThemedTextInputProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('text-gray-700 bg-white'),
    dark = tailwind('text-white bg-gray-800'),
    ...otherProps
  } = props
  return (
    <TextInput
      placeholderTextColor={isLight ? 'rgba(0, 0, 0, 0.4)' : '#828282'}
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
