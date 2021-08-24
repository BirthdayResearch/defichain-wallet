import React from 'react'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { Text, TextProps } from '../Text'
import { ThemedProps } from './index'

type ThemedTextProps = TextProps & ThemedProps

export function ThemedText (props: ThemedTextProps): JSX.Element {
  const { theme } = useThemeContext()
  const { style, light, dark, ...otherProps } = props
  return <Text style={[style, tailwind(theme === 'light' ? light : dark)]} {...otherProps} />
}
