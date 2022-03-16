import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { View } from 'react-native'
import { ThemedProps } from './index'

type ThemedViewProps = View['props'] & ThemedProps

export function ThemedView (props: ThemedViewProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-gray-50'),
    dark = tailwind('bg-gray-900'),
    ...otherProps
  } = props
  return (
    <View
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
