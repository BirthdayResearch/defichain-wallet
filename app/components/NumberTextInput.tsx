import * as Localization from 'expo-localization'
import React from 'react'
import { KeyboardTypeOptions, Platform, TextInputProps } from 'react-native'
import { TextInput } from './index'

export function NumberTextInput (props: React.PropsWithChildren<TextInputProps>): JSX.Element {
  let keyboardType: KeyboardTypeOptions = 'numeric'
  if (Platform.OS === 'ios' && Localization.decimalSeparator !== '.') {
    keyboardType = 'default'
  }
  return (
    <TextInput
      placeholderTextColor='rgba(0, 0, 0, 0.4)'
      {...props}
      keyboardType={keyboardType}
    />
  )
}
