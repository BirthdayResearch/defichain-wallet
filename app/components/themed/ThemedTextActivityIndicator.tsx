import React from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedActivityIndicator } from './ThemedActivityIndicator'
import { ThemedText } from './ThemedText'
import { ThemedProps } from '.'

interface ThemedTextActivityIndicatorProps extends ThemedProps {
  message?: string
}

export function ThemedTextActivityIndicator ({ message, light, dark }: ThemedTextActivityIndicatorProps): JSX.Element | null {
  if (message === undefined) {
    return null
  }

  return (
    <View style={tailwind('flex-row justify-center')}>
      <ThemedActivityIndicator />
      <ThemedText
        style={tailwind('ml-2')}
        light={light}
        dark={dark}
      >
        {message}
      </ThemedText>
    </View>
  )
}
