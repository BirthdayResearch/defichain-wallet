// @ts-expect-error
import Avatar from 'react-native-boring-avatars'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

export function RandomAvatar (props: Avatar['props']): JSX.Element {
  const {
    name,
    size,
    ...otherProps
  } = props
  const { isLight } = useThemeContext()
  return (
    <Avatar
      size={size}
      name={name}
      variant='bauhaus'
      colors={isLight ? ['#EE63B9', '#346DCD', '#F5D547', '#09200D', '#2FA66B'] : ['#CD5099', '#4471BA', '#E1C94E', '#F0F7F1', '#6CC99C']}
      {...otherProps}
    />
  )
}
