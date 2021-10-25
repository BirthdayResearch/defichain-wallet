import * as React from 'react'
import { tailwind } from '@tailwind'
import { ThemedView } from '@components/themed'

export function Vaults (): JSX.Element {
  return (
    <ThemedView style={tailwind('h-full m-4')} />
  )
}
