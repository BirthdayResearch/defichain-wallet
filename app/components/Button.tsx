import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { useThemeContext } from '../contexts/ThemeProvider'
import { tailwind } from '../tailwind'
import { Text } from './Text'

interface ButtonProps extends React.PropsWithChildren<TouchableOpacityProps> {
  color?: 'primary' | 'secondary'
  fill?: 'fill' | 'outline' | 'flat'
  label?: string
  margin?: string
  title?: string
}

export function Button (props: ButtonProps): JSX.Element {
  const {
    color = 'primary',
    fill = 'fill',
    margin = 'm-4 mt-8'
  } = props
  const { isLight } = useThemeContext()
  const themedColor = isLight ? `${color}` : `dark${color}`

  const disabledStyle = isLight ? 'bg-gray-200 border-0' : 'bg-gray-600 text-gray-500 border-0'
  const disabledText = isLight ? 'text-gray-400' : 'text-gray-500'

  const buttonColor = isLight ? `bg-${themedColor}-50` : `bg-${themedColor}-700`
  const buttonStyle = `${fill === 'fill' ? buttonColor : 'bg-transparent'}`
  const buttonText = isLight ? `text-${themedColor}-500` : `${fill === 'fill' ? 'text-white' : 'text-primary-700'}`

  const textStyle = `${props.disabled === true ? disabledText : buttonText}`
  return (
    <TouchableOpacity
      {...props}
      style={tailwind(`${margin} p-3 rounded flex-row justify-center ${buttonStyle} ${props.disabled === true ? disabledStyle : ''}`)}
    >
      {
        props.label !== undefined &&
          <Text style={(tailwind(`${textStyle} font-bold`))}>
            {props.label}
          </Text>
      }

      {
        props.children
      }
    </TouchableOpacity>
  )
}
