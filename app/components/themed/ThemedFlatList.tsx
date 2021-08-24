import React from 'react'
import { FlatList } from 'react-native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedProps } from './index'

type ThemedFlatListProps = FlatList['props'] & ThemedProps

export function ThemedFlatList (props: ThemedFlatListProps): JSX.Element {
  const { theme } = useThemeContext()
  const { style, light = 'bg-gray-100', dark = 'bg-dark', ...otherProps } = props

  return <FlatList style={[style, tailwind(theme === 'light' ? light : dark)]} {...otherProps} />
}
