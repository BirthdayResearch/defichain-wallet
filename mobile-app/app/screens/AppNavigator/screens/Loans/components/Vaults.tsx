import * as React from 'react'
import { tailwind } from '@tailwind'
import { ThemedText, ThemedView } from '@components/themed'

export function Vaults (): JSX.Element {
  return (
    <ThemedView style={tailwind('h-full')}>
      <ThemedText>Vaults placeholder page</ThemedText>
    </ThemedView>
  )
}
