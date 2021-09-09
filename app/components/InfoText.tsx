import { tailwind } from '@tailwind'
import React from 'react'
import { TextProps } from '.'
import { ThemedIcon, ThemedProps, ThemedText, ThemedView } from './themed'

interface InfoTextProp extends ThemedProps, TextProps {
  text: string
}

export function InfoText (props: InfoTextProp): JSX.Element {
  const {
    style,
    light = tailwind('bg-warning-50'),
    dark = tailwind('bg-darkwarning-50'),
    ...otherProps
  } = props

  return (
    <ThemedView
      style={[
        tailwind('rounded m-4 mb-0 p-2 flex-row'),
        style
      ]}
      light={light}
      dark={dark}
    >
      <ThemedIcon
        iconType='MaterialIcons'
        name='info'
        size={14}
        light={tailwind('text-warning-500')}
        dark={tailwind('text-darkwarning-500')}
      />
      <ThemedText
        style={tailwind('text-xs pl-2 font-medium flex-1')}
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        {...otherProps}
      >
        {props.text}
      </ThemedText>
    </ThemedView>
  )
}
