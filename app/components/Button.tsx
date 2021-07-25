import React from 'react'
import { ButtonProps, TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export type ButtonFillTypes = 'fill' | 'outline' | 'flat'
export type ButtonColor = 'primary' | 'secondary'

export function Button (props: React.PropsWithChildren<ButtonProps> & { color?: ButtonColor, fill?: ButtonFillTypes, label?: string }): JSX.Element {
  const {
    color = 'primary',
    fill = 'fill'
  } = props
  const buttonStyle = `${fill === 'flat' ? 'border-none' : `border border-${color} border-opacity-20`}
                    ${fill === 'fill' ? `bg-${color} bg-opacity-10` : 'bg-transparent'}`
  const disabledStyle = 'bg-black bg-opacity-20 text-white text-opacity-5 border-0'

  const textStyle = `${props.disabled === true ? 'text-white text-opacity-20' : `text-${color}`}`
  return (
    <TouchableOpacity
      {...props}
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
