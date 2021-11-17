import React from 'react'
import { tailwind } from '../tailwind'
import { ThemedText } from './themed'

export function SectionTitle ({ text, testID }: { text: string, testID: string }): JSX.Element {
  return (
    <ThemedText
      dark={tailwind('bg-dfxblue-900 text-dfxgray-500')}
      light={tailwind('bg-gray-100 text-dfxgray-500')}
      style={tailwind('p-4 pt-6 text-xs text-dfxgray-500 font-medium')}
      testID={testID}
    >
      {
        text
      }
    </ThemedText>
  )
}
