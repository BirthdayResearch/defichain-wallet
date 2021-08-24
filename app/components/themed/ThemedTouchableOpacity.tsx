import React from 'react'
import { TouchableOpacity } from 'react-native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedProps } from './index'

type ThemedTouchableOpacityProps = TouchableOpacity['props'] & ThemedProps

export function ThemedTouchableOpacity (props: ThemedTouchableOpacityProps): JSX.Element {
  const { theme } = useThemeContext()
  const { style, light, dark, ...otherProps } = props
  return <TouchableOpacity style={[style, tailwind(theme === 'light' ? light : dark)]} {...otherProps} />
}
