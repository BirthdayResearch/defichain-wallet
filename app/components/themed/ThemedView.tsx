import React from 'react'
import { View } from 'react-native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedProps } from './index'

type ThemedViewProps = View['props'] & ThemedProps

export function ThemedView (props: ThemedViewProps): JSX.Element {
  const { theme } = useThemeContext()
  const { style, light = 'bg-gray-100', dark = 'bg-gray-900', ...otherProps } = props
  return <View style={[style, tailwind(theme === 'light' ? light : dark)]} {...otherProps} />
}
