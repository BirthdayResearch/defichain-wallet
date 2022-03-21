import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { ScrollView } from 'react-native'
import { ThemedProps } from './index'

type ThemedScrollViewProps = ScrollView['props'] & ThemedProps

export function ThemedScrollView (props: ThemedScrollViewProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-gray-50'),
    dark = tailwind('bg-gray-900'),
    ...otherProps
  } = props
  return (
    <ScrollView
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
