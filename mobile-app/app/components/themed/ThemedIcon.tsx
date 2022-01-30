import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { IconProps } from '@expo/vector-icons/build/createIconSet'
import { tailwind } from '@tailwind'

import { ThemedProps } from './index'

export type IconType = 'MaterialCommunityIcons' | 'MaterialIcons'

interface IThemedIcon {
  iconType: IconType
}

type ThemedIconProps = ThemedProps & IThemedIcon & IconProps<any>

export function ThemedIcon (props: ThemedIconProps): JSX.Element {
  const { isLight } = useThemeContext()
  const {
    style,
    iconType,
    light = tailwind('text-black'),
    dark = tailwind('text-white text-opacity-90'),
    ...otherProps
  } = props
  if (iconType === 'MaterialIcons') {
    return (
      <MaterialIcons
        style={[style, isLight ? light : dark]}
        {...otherProps}
      />
    )
  } else if (iconType === 'MaterialCommunityIcons') {
    return (
      <MaterialCommunityIcons
        style={[style, isLight ? light : dark]}
        {...otherProps}
      />
    )
  } else {
    return <></>
  }
}
