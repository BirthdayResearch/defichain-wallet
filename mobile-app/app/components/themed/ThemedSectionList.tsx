import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { SectionList, SectionListProps } from 'react-native'
import { ThemedProps } from './index'

type ThemedSectionListProps = SectionListProps<any, any> & ThemedProps

export function ThemedSectionList (props: ThemedSectionListProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-gray-50'),
    dark = tailwind('bg-gray-900'),
    ...otherProps
  } = props

  return (
    <SectionList
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
