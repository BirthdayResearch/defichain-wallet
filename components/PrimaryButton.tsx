import React from 'react'
import { ButtonProps, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import tailwind from 'tailwind-rn'
import { PrimaryColor } from '../constants/Theme'

export const PrimaryButtonStyle = StyleSheet.create({
  button: {
    backgroundColor: PrimaryColor,
    color: '#ffffff'
  },
  disabled: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: 'rgba(255,255,255,0.06)'
  }
})

export function PrimaryButton (props: React.PropsWithChildren<ButtonProps> & { touchableStyle?: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <TouchableOpacity
      testID={`primary_button_${props.title}`}
      disabled={props.disabled}
      onPress={props.onPress}
      style={[
        tailwind('m-4 mt-8 p-3 rounded flex-row justify-center'),
        props.touchableStyle,
        props.disabled === true ? PrimaryButtonStyle.disabled : PrimaryButtonStyle.button
      ]}
    >
      {
        props.children
      }
    </TouchableOpacity>
  )
}
