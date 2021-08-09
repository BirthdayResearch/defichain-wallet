import React from 'react'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export function SectionTitle ({ text, testID }: { text: string, testID: string }): JSX.Element {
  return (
    <Text
      testID={testID}
      style={[tailwind('p-4 pt-6 text-xs text-gray-500 font-medium bg-gray-100')]}
    >
      {
        text
      }
    </Text>
  )
}
