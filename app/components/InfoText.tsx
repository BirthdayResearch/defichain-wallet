import { useThemeContext } from '@contexts/ThemeProvider'
import { MaterialIcons } from '@expo/vector-icons'
import { tailwind } from '@tailwind'
import React from 'react'
import { Text, View } from 'react-native'
import { TextProps } from '.'
import { ThemedProps } from './themed'

interface InfoTextProp extends ThemedProps, TextProps {
  text: string
}

export function InfoText (props: InfoTextProp): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('text-gray-600'),
    dark = tailwind('text-gray-300'),
    ...otherProps
  } = props

  return (
    <View style={[tailwind('rounded m-4 mb-0 p-2 flex-row'), (isLight ? tailwind('bg-warning-50') : tailwind('bg-darkwarning-50'))]}>
      <MaterialIcons name='info' size={14} style={isLight ? tailwind('text-warning-500') : tailwind('text-darkwarning-500')} />
      <Text
        style={[
          tailwind('text-xs pl-2 font-medium flex-1'),
          isLight ? light : dark,
          style
        ]}
        {...otherProps}
      >
        {props.text}
      </Text>
    </View>
  )
}
