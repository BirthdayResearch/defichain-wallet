import React from 'react'
import { ButtonProps, TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export type ButtonFillTypes = 'fill' | 'outline' | 'flat'
export type ButtonColor = 'primary' | 'secondary'

export function Button (props: React.PropsWithChildren<ButtonProps> & { color?: ButtonColor, fill?: ButtonFillTypes, label?: string }): JSX.Element {
  const buttonColor = props.color ?? 'primary'
  const buttonFill = props.fill ?? 'fill'
  const buttonStyle = `${buttonFill === 'flat' ? 'border-none' : `border border-${buttonColor} border-opacity-20`}
                    ${buttonFill === 'fill' ? `bg-${buttonColor} bg-opacity-10` : 'bg-transparent'}`
  const disabledStyle = 'bg-black bg-opacity-20 text-white text-opacity-5 border-0'

  const textStyle = `${props.disabled === true ? 'text-white text-opacity-20' : `text-${buttonColor}`}`
  return (
    <TouchableOpacity
      {...props}
      testID={props.testID}
      disabled={props.disabled}
      onPress={props.onPress}
      style={[tailwind(`m-4 mt-8 p-3 rounded flex-row justify-center ${buttonStyle} ${props.disabled === true ? disabledStyle : ''}`)]}
    >
      {
        props.label !== undefined &&
          <Text style={(tailwind(`${textStyle} font-bold`))}>{props.label}</Text>
      }
      {
        props.children
      }
    </TouchableOpacity>
  )
}
