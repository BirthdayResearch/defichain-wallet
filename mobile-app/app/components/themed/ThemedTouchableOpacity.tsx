import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { TouchableOpacity } from 'react-native'
import { ThemedProps } from './index'

type ThemedTouchableOpacityProps = TouchableOpacity['props'] & ThemedProps

export function ThemedTouchableOpacity (props: ThemedTouchableOpacityProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('bg-white border-b border-gray-200'),
    dark = tailwind('bg-gray-800 border-b border-gray-700'),
    ...otherProps
  } = props
  return (
    <TouchableOpacity
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
