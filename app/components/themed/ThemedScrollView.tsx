import React from 'react'
import { ScrollView } from 'react-native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedProps } from './index'

type ThemedScrolViewProps = ScrollView['props'] & ThemedProps

export function ThemedScrollView (props: ThemedScrolViewProps): JSX.Element {
  const { theme } = useThemeContext()
  const { style, light = 'bg-gray-100', dark = 'bg-dark', ...otherProps } = props
  return <ScrollView style={[style, tailwind(theme === 'light' ? light : dark)]} {...otherProps} />
}
