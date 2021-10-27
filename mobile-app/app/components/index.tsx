import React from 'react'
import { Switch as DefaultSwitch, TextInput as DefaultTextInput, View as DefaultView } from 'react-native'
import { tailwind } from '@tailwind'

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
      ios_backgroundColor='#ffffff'
      thumbColor='#fff'
      trackColor={{ false: 'rgba(120, 120, 128, 0.20)', true: '#34C759' }}
      {...otherProps}
    />
  )
}

export * from './Text'
