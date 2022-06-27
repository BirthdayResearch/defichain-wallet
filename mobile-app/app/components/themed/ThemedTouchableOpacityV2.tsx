import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { TouchableOpacity } from 'react-native'
import { ThemedProps } from './index'

type ThemedTouchableOpacityProps = TouchableOpacity['props'] & ThemedProps

export function ThemedTouchableOpacityV2 (props: ThemedTouchableOpacityProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('border-b border-mono-light-v2-300'),
    dark = tailwind('border-b border-mono-dark-v2-300'),
    ...otherProps
  } = props
  return (
    <TouchableOpacity
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
