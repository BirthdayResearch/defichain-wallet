import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { FlatList } from 'react-native'
import { ThemedProps } from './index'

type ThemedFlatListProps = FlatList['props'] & ThemedProps

export function ThemedFlatList (props: ThemedFlatListProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-gray-100'),
    dark = tailwind('bg-dfxblue-900'),
    ...otherProps
  } = props

  return (
    <FlatList
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
