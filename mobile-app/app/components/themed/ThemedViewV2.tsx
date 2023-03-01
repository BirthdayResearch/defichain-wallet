import { useThemeContext } from "@waveshq/walletkit-ui";
import { tailwind } from "@tailwind";

import { View } from "react-native";
import { ThemedProps } from "./index";

type ThemedViewProps = View["props"] & ThemedProps;

export function ThemedViewV2(props: ThemedViewProps): JSX.Element {
  const { isLight } = useThemeContext();
  const {
    style,
    light = tailwind("bg-mono-light-v2-100"),
    dark = tailwind("bg-mono-dark-v2-100"),
    ...otherProps
  } = props;
  return <View style={[style, isLight ? light : dark]} {...otherProps} />;
}
