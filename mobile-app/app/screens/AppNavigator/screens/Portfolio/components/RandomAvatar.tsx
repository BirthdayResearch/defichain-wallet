// @ts-expect-error
import Avatar from "@mealection/react-native-boring-avatars";

export function RandomAvatar(props: Avatar["props"]): JSX.Element {
  const { name, size, ...otherProps } = props;
  return (
    <Avatar
      size={size}
      name={name}
      variant="bauhaus"
      colors={["#FF008C", "#5B10FF", "#FFAC47", "#00AD1D", "#112E91"]}
      {...otherProps}
    />
  );
}
