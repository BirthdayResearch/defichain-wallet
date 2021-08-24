import React from 'react'
import { tailwind } from '../tailwind'
import { ThemedText } from './themed'

export function SectionTitle ({ text, testID }: { text: string, testID: string }): JSX.Element {
  return (
    <ThemedText
      testID={testID}
      style={[tailwind('p-4 pt-6 text-xs text-gray-500 font-medium')]}
      light='bg-gray-100 text-gray-500'
      dark='bg-dark text-white text-opacity-90'
    >
      {
        text
      }
    </ThemedText>
  )
}
