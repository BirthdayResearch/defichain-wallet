import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { TouchableOpacity } from 'react-native'
import { ThemedProps } from './index'

type ThemedTouchableOpacityProps = TouchableOpacity['props'] & ThemedProps

export function ThemedTouchableOpacityV2 (props: ThemedTouchableOpacityProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style = tailwind('border-b'),
    light = tailwind('border-mono-light-v2-300'),
    dark = tailwind('bg-dfxblue-800 border-b border-dfxblue-900'),
    activeOpacity = 0.7,
    ...otherProps
  } = props
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
