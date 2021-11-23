import React from 'react'
import { Switch as DefaultSwitch, TextInput as DefaultTextInput, View as DefaultView } from 'react-native'
import { tailwind } from '@tailwind'
import { theme } from '../tailwind.config'

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

  return (
    <DefaultSwitch
      ios_backgroundColor={theme.extend.colors.dfxgray[400]}
      thumbColor='#fff'
      trackColor={{ false: theme.extend.colors.dfxgray[400], true: '#34C759' }}
      {...otherProps}
    />
  )
}

export * from './Text'
