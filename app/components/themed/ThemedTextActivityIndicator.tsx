import React from 'react'
import { View } from 'react-native'
import { tailwind } from '@tailwind'
import { ThemedActivityIndicator } from './ThemedActivityIndicator'
import { ThemedText } from './ThemedText'

export function ThemedTextActivityIndicator ({ message }: { message?: string }): JSX.Element | null {
  if (message === undefined) {
    return null
  }

  return (
    <View style={tailwind('flex-row justify-center p-2')}>
      <ThemedActivityIndicator />
      <ThemedText style={tailwind('ml-2')}>
        {message}
      </ThemedText>
    </View>
  )
}
