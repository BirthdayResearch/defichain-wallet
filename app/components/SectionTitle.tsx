import React from 'react'
import { Text } from 'react-native'
import { tailwind } from '../../tailwind'

export function SectionTitle ({ text, testID }: { text: string, testID: string }): JSX.Element {
  return (
    <Text
      testID={testID}
      style={[tailwind('p-4 text-xs text-gray-500 font-bold mt-2')]}
    >
      {
        text
      }
    </Text>
  )
}
