import { useThemeContext } from '@contexts/ThemeProvider'
import React from 'react'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { theme } from '../../tailwind.config'
import { ThemedProps } from './index'

type ThemedTextProps = ActivityIndicatorProps & ThemedProps

export function ThemedActivityIndicator (props: ThemedTextProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    ...otherProps
  } = props
  return (
    <ActivityIndicator
      color={isLight ? '#ff00af' : theme.extend.colors.darkprimary[500]}
      style={style}
      {...otherProps}
    />
  )
}
