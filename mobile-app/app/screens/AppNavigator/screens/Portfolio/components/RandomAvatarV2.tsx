// @ts-expect-error
import Avatar from 'react-native-boring-avatars'

export function RandomAvatarV2
 (props: Avatar['props']): JSX.Element {
  const {
    name,
    size,
    ...otherProps
  } = props
  return (
    <Avatar
      size={size}
      name={name}
      variant='sunset'
      colors={['#FF008C', '#5B10FF', '#FFAC47', '#00AD1D', '#112E91']}
      {...otherProps}
    />
  )
}
