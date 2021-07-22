import React from 'react'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export function SectionTitle ({ text, testID }: { text: string, testID: string }): JSX.Element {
  return (
    <Text
      testID={testID}
      style={[tailwind('p-4 text-xs text-gray-500 mt-2')]}
      fontWeight='medium'
    >
      {
        text
      }
    </Text>
  )
}
