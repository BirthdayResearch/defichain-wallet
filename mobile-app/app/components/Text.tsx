import { Text as DefaultText } from "react-native";
import { useStyles } from "@tailwind";

export type TextProps = DefaultText["props"];

export function Text(props: TextProps): JSX.Element {
  const { style, ...otherProps } = props;
  const { tailwind } = useStyles();
  return (
    <DefaultText
      style={[tailwind("font-normal text-base"), style]}
      {...otherProps}
    />
  );
}
