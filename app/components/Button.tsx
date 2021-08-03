import React from 'react'
import { ButtonProps as Props, TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { Text } from './Text'

interface ButtonProps extends React.PropsWithChildren<Props> {
  color?: 'primary' | 'secondary'
  fill?: 'fill' | 'outline' | 'flat'
  label?: string
  margin?: string
  delayLongPress?: number
  onLongPress?: () => void
}

export function Button (props: ButtonProps): JSX.Element {
  const {
    color = 'primary',
    fill = 'fill',
    margin = 'm-4 mt-8'
  } = props
  const buttonStyle = `${fill === 'flat' ? 'border-0' : `border border-${color} border-opacity-20`}
                    ${fill === 'fill' ? `bg-${color} bg-opacity-10` : 'bg-transparent'}`
  const disabledStyle = 'bg-black bg-opacity-20 text-white text-opacity-5 border-0'

  const textStyle = `${props.disabled === true ? 'text-white text-opacity-20' : `text-${color}`}`
  return (
    <TouchableOpacity
      {...props}
      onLongPress={e => {
        if (props.onLongPress !== undefined) {
          props.onLongPress()
        }
      }}
      style={[tailwind(`${margin} p-3 rounded flex-row justify-center ${buttonStyle} ${props.disabled === true ? disabledStyle : ''}`)]}
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
