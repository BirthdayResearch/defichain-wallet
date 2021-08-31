import { useThemeContext } from '@contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import React from 'react'
import { ScrollView } from 'react-native'
import { ThemedProps } from './index'

type ThemedScrolViewProps = ScrollView['props'] & ThemedProps

export function ThemedScrollView (props: ThemedScrolViewProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-gray-100'),
    dark = tailwind('bg-gray-900'),
    ...otherProps
  } = props
  return (
    <ScrollView
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
