import React from 'react'
import { View } from 'react-native'
import { useThemeContext } from '../../contexts/ThemeProvider'
import { tailwind } from '../../tailwind'
import { ThemedProps } from './index'

type ThemedViewProps = View['props'] & ThemedProps

export function ThemedView (props: ThemedViewProps): JSX.Element {
  const { isLight } = useThemeContext()
  const { style, light = tailwind('bg-gray-100'), dark = tailwind('bg-gray-900'), ...otherProps } = props
  return (
    <View
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
