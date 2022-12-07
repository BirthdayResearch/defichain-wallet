import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { useStyles } from "@tailwind";
import BigNumber from "bignumber.js";
import { ThemedTextV2, ThemedViewV2 } from "./themed";

export function CollateralFactorTag(props: {
  factor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}): JSX.Element | null {
  const { tailwind } = useStyles();
  const {
    factor,
    containerStyle = tailwind(
      "h-5 flex flex-row items-center px-2 rounded border-0.5"
    ),
    textStyle = tailwind("text-xs font-semibold-v2"),
  } = props;
  const DEFAULT_FACTOR = new BigNumber(1);
  return factor !== undefined && !DEFAULT_FACTOR.isEqualTo(factor) ? (
    <ThemedViewV2
      style={containerStyle}
      light={tailwind("border-mono-light-v2-700")}
      dark={tailwind("border-mono-dark-v2-700")}
    >
      <ThemedTextV2
        style={textStyle}
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-dark-v2-700")}
      >
        {`${factor}x`}
      </ThemedTextV2>
    </ThemedViewV2>
  ) : null;
}
