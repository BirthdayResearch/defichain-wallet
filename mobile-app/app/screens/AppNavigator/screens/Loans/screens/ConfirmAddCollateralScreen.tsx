import { View } from '@components'
import { ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import React from 'react'

export function ConfirmAddCollateralScreen (): JSX.Element {
  return (
    <View style={tailwind('flex-1')}>
      <ThemedScrollView
        contentContainerStyle={tailwind('p-4')}
      >
        <ThemedText style={tailwind('bg-warning-500 h-96 border-2 border-gray-900')}>Hello content</ThemedText>
        <ThemedText style={tailwind('bg-warning-500 h-96 border-2 border-gray-900')}>Hello content</ThemedText>
        <ThemedText style={tailwind('bg-warning-500 h-96 border-2 border-gray-900')}>Hello content</ThemedText>

      </ThemedScrollView>
      <ThemedView
        style={tailwind('absolute left-0 bottom-0 w-full')}
      >
        <ThemedText>Hello footer</ThemedText>
        <ThemedText>Hello footer</ThemedText>
        <ThemedText>Hello footer</ThemedText>
        <ThemedText>Hello footer</ThemedText>
      </ThemedView>
    </View>
  )
}
