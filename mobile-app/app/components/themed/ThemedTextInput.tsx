import * as Localization from 'expo-localization'
import React from 'react'
import { KeyboardTypeOptions, Platform, TextInputProps } from 'react-native'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import { TextInput } from '../index'

export function ThemedTextInput (props: React.PropsWithChildren<TextInputProps>): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    keyboardType,
    ...otherProps
  } = props

  const getKeyboardType = (): KeyboardTypeOptions | undefined => {
    if (keyboardType === 'numeric' && Platform.OS === 'ios' && Localization.decimalSeparator !== '.') {
      return 'default'
    }
    return keyboardType
  }

  return (
    <TextInput
      placeholderTextColor={isLight ? 'rgba(0, 0, 0, 0.4)' : '#828282'}
      style={[style, tailwind(isLight ? 'text-gray-700' : 'text-white')]}
      {...otherProps}
      keyboardType={getKeyboardType()}
    />
  )
}
