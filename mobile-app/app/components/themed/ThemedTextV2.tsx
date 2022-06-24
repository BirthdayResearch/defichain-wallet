import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { Text, TextProps } from '../Text'
import { ThemedProps } from './index'

type ThemedTextProps = TextProps & ThemedProps

export function ThemedTextV2 (props: ThemedTextProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('text-mono-light-v2-900'),
    dark = tailwind('text-mono-dark-v2-900'),
    ...otherProps
  } = props
  return (
    <Text
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
