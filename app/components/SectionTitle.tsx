import React from 'react'
import { useThemeContext } from '../contexts/ThemeProvider'
import { tailwind } from '../tailwind'
import { Text } from './Text'

export function SectionTitle ({ text, testID }: { text: string, testID: string }): JSX.Element {
  const { getThemeClass } = useThemeContext()
  return (
    <Text
      testID={testID}
      style={[tailwind('p-4 pt-6 text-xs text-gray-500 font-medium', getThemeClass('body-bg title-text'))]}
    >
      {
        text
      }
    </Text>
  )
}
