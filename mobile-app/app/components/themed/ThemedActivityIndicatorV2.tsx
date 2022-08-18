import { getColor } from '@tailwind'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { ThemedProps } from './index'
import { theme } from '../../tailwind.config'

type ThemedTextProps = ActivityIndicatorProps & ThemedProps

export function ThemedActivityIndicatorV2 (props: ThemedTextProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    ...otherProps
  } = props
  return (
    <ActivityIndicator
      color={isLight ? getColor('brand-v2-500') : theme.extend.colors.dfxred[500]}
      style={style}
      {...otherProps}
    />
  )
}
