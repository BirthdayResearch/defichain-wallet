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
  const { theme } = useThemeContext()
  const isLight = theme === 'light'
  const themedColor = isLight ? `${color}-500` : `dark${color}-500`
  const buttonStyle = `${fill === 'flat' ? 'border-0' : `border border-${themedColor} border-opacity-20`}
                    ${fill === 'fill' ? `bg-${themedColor} bg-opacity-10` : 'bg-transparent'}`
  const disabledStyle = isLight ? 'bg-black bg-opacity-20 text-white text-opacity-5 border-0' : 'bg-gray-600 text-white text-opacity-5 border-0'

  const textStyle = `${props.disabled === true ? 'text-white text-opacity-20' : `text-${themedColor}`}`
  return (
    <TouchableOpacity
      {...props}
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
