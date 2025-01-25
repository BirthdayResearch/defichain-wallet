import React from "react";
import Avatar from "boring-avatars";

type AvatarProps = React.ComponentProps<typeof Avatar>;

export function RandomAvatar(props: AvatarProps): JSX.Element {
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
