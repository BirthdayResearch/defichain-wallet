import { useThemeContext } from "@waveshq/walletkit-ui";
import { tailwind } from "@tailwind";
import { forwardRef } from "react";

import { ScrollView } from "react-native";
import { ThemedProps } from "./index";

type ThemedScrollViewProps = ScrollView["props"] & ThemedProps;

export const ThemedScrollViewV2 = forwardRef(
  (props: ThemedScrollViewProps, ref: React.Ref<any>): JSX.Element => {
    const { isLight } = useThemeContext();
    const {
      style,
      light = tailwind("bg-mono-light-v2-100"),
      dark = tailwind("bg-mono-dark-v2-100"),
      ...otherProps
    } = props;
    return (
      <ScrollView
        style={[style, isLight ? light : dark]}
        ref={ref}
        {...otherProps}
      />
    );
  }
);
