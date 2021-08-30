import * as Localization from 'expo-localization'
import React from 'react'
import { KeyboardTypeOptions, Platform, TextInputProps } from 'react-native'
import { useThemeContext } from '../contexts/ThemeProvider'
import { tailwind } from '../tailwind'
import { TextInput } from './index'

export function NumberTextInput (props: React.PropsWithChildren<TextInputProps>): JSX.Element {
  const { isLight } = useThemeContext()
  const { style, ...otherProps } = props
  let keyboardType: KeyboardTypeOptions = 'numeric'
  if (Platform.OS === 'ios' && Localization.decimalSeparator !== '.') {
    keyboardType = 'default'
  }
  return (
    <TextInput
      placeholderTextColor={isLight ? 'rgba(0, 0, 0, 0.4)' : '#828282'}
      style={[style, tailwind(isLight ? 'text-gray-700' : 'text-white')]}
      {...otherProps}
      keyboardType={keyboardType}
    />
  )
}
