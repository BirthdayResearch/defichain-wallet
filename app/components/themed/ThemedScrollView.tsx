import React from 'react'
import { ScrollView } from 'react-native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedProps } from './index'

type ThemedScrolViewProps = ScrollView['props'] & ThemedProps

export function ThemedScrollView (props: ThemedScrolViewProps): JSX.Element {
  const { isLight } = useThemeContext()
  const { style, light = 'bg-gray-100', dark = 'bg-gray-900', ...otherProps } = props
  return <ScrollView style={[style, tailwind(isLight ? light : dark)]} {...otherProps} />
}
