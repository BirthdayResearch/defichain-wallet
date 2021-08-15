import * as Localization from 'expo-localization'
import React from 'react'
import { TextInputProps } from 'react-native'
import { TextInput } from './index'

export function NumberTextInput (props: React.PropsWithChildren<TextInputProps>): JSX.Element {
  const keyboardType = Localization.decimalSeparator === '.' ? 'numeric' : 'default'
  return (
    <TextInput
      placeholderTextColor='rgba(0, 0, 0, 0.4)'
      {...props}
      keyboardType={keyboardType}
    />
  )
}
