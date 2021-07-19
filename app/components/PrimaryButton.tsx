import React from 'react'
import { ButtonProps, StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { tailwind } from '../../tailwind'

export const PrimaryButtonStyle = StyleSheet.create({
  button: {
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
      {...props}
      testID={props.testID}
      disabled={props.disabled}
      onPress={props.onPress}
      style={[tailwind('m-4 mt-8 p-3 rounded flex-row justify-center bg-primary'), props.disabled === true ? PrimaryButtonStyle.disabled : PrimaryButtonStyle.button, props.touchableStyle]}
    >
      {
        props.children
      }
    </TouchableOpacity>
  )
}
