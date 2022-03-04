// @ts-expect-error
import Avatar from 'react-native-boring-avatars'
import { theme } from '../../../../../tailwind.config'

export function RandomAvatar (props: Avatar['props']): JSX.Element {
  const {
    name,
    size,
    ...otherProps
  } = props
  return (
    <Avatar
      size={size}
      name={name}
      variant='bauhaus'
      colors={['#BCD3E8', '#1E6AB0', '#7FAAD2', '#FFFFFF', theme.extend.colors.dfxblue[900]]}
      {...otherProps}
    />
  )
}
