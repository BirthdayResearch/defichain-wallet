import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { tailwind } from '@tailwind'

import { Text, TextProps } from '../Text'
import { ThemedProps } from './index'

type ThemedTextProps = TextProps & ThemedProps

export function ThemedText (props: ThemedTextProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    light = tailwind('text-black'),
    dark = tailwind('text-white text-opacity-90'),
    ...otherProps
  } = props
  return (
    <Text
      style={[style, isLight ? light : dark]}
      {...otherProps}
    />
  )
}
