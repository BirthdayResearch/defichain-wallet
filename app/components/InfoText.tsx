import { useThemeContext } from '@contexts/ThemeProvider'
import { MaterialIcons } from '@expo/vector-icons'
import { tailwind } from '@tailwind'
import React from 'react'
import { Text, View } from 'react-native'
import { ThemedProps } from './themed'

interface InfoTextProp extends ThemedProps {
  text: string
}

export function InfoText (props: InfoTextProp): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    light = tailwind('bg-warning-50'),
    dark = tailwind('bg-darkwarning-50')
  } = props

  return (
    <View style={[tailwind('rounded m-4 p-2 flex-row'), (isLight ? light : dark)]}>
      <MaterialIcons name='info' size={14} style={isLight ? tailwind('text-warning-500') : tailwind('text-darkwarning-500')} />
      <Text style={[
        tailwind('text-xs pl-2'),
        isLight ? tailwind('text-gray-600') : tailwind('text-gray-300')
      ]}
      >
        {props.text}
      </Text>
    </View>
  )
}
