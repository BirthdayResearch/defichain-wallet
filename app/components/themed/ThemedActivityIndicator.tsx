import { useThemeContext } from '@contexts/ThemeProvider'
import React from 'react'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
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
      color={isLight ? '#ff00af' : '#EE2CB1'}
      style={style}
      {...otherProps}
    />
  )
}
