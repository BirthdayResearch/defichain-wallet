import React from 'react'
import { Switch as DefaultSwitch, View as DefaultView } from 'react-native'
import { theme } from '../tailwind.config'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export function View (props: DefaultView['props']): JSX.Element {
  const { style, ...otherProps } = props

  return (
    <DefaultView
      style={style}
      {...otherProps}
    />
  )
}

export function Switch (props: DefaultSwitch['props']): JSX.Element {
  const { style, ...otherProps } = props
  const { isLight } = useThemeContext()

  return (
    <DefaultSwitch
      ios_backgroundColor={isLight ? '#E5E5E5' : theme.extend.colors.dfxgray[400]}
      thumbColor='#FFFFFF'
      trackColor={{ false: isLight ? '#E5E5E5' : theme.extend.colors.dfxgray[400], true: isLight ? '#02B31B' : '#34C759' }}
      {...otherProps}
    />
  )
}

export * from './Text'
