import { getColor } from "@tailwind";

import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { ThemedProps } from "./index";

type ThemedTextProps = ActivityIndicatorProps & ThemedProps;

export function ThemedActivityIndicatorV2(props: ThemedTextProps): JSX.Element {
  const { style, ...otherProps } = props;
  return (
    <ActivityIndicator
      color={getColor("brand-v2-500")}
      style={style}
      {...otherProps}
    />
  );
}
