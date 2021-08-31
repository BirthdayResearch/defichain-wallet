import { useThemeContext } from '@contexts/ThemeProvider'
import { tailwind } from '@tailwind'
import React from 'react'
import { SectionList, SectionListProps } from 'react-native'
import { ThemedProps } from './index'

type ThemedSectionListProps = SectionListProps<any, any> & ThemedProps

export function ThemedSectionList (props: ThemedSectionListProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-gray-100'),
    dark = tailwind('bg-blue-900'),
    ...otherProps
  } = props

  return (
    <SectionList
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
