import React from 'react'
import { Switch as DefaultSwitch, TextInput as DefaultTextInput, View as DefaultView } from 'react-native'
import { tailwind } from '@tailwind'
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

export function TextInput (props: DefaultTextInput['props']): JSX.Element {
  const { style, ...otherProps } = props

  return (
    <DefaultTextInput
      style={[tailwind('font-normal text-base'), style]}
      {...otherProps}
    />
  )
}

export function Switch (props: DefaultSwitch['props']): JSX.Element {
  const { style, ...otherProps } = props
  const { isLight } = useThemeContext()

  return (
    <DefaultSwitch
      ios_backgroundColor={isLight ? '#E5E5E5' : '#404040'}
      thumbColor='#FFFFFF'
      trackColor={{ false: isLight ? '#E5E5E5' : '#404040', true: isLight ? '#02B31B' : '#32D74B' }}
      {...otherProps}
    />
  )
}

export * from './Text'
