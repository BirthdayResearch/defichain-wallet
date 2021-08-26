import React from 'react'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { Text, TextProps } from '../Text'
import { ThemedProps } from './index'

type ThemedTextProps = TextProps & ThemedProps

export function ThemedText (props: ThemedTextProps): JSX.Element {
  const { isLight } = useThemeContext()
  const { style, light = 'text-black', dark = 'text-white text-opacity-90', ...otherProps } = props
  return <Text style={[style, tailwind(isLight ? light : dark)]} {...otherProps} />
}
