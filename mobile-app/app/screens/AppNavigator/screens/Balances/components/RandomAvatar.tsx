import Avatar from 'react-native-boring-avatars'

export function RandomAvatar (props: Avatar['props']): JSX.Element {
  const { name, size, ...otherProps } = props
  return (
    <Avatar
      size={size}
      name={name}
      variant='pixel'
      colors={['#EE2CB1', '#604EBF', '#DB69B8', '#FAEAF5', '#262626']}
      {...otherProps}
    />
  )
}
