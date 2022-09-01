import React from "react";
import { StyleProp, View, ViewProps } from "react-native";
import { tailwind } from "@tailwind";
import { getNativeIcon } from "@components/icons/assets";

interface PoolPairIconV2Props {
  symbolA: string;
  symbolB: string;
  customSize?: number;
  iconBStyle?: StyleProp<ViewProps>;
  testID?: string;
}

export function PoolPairIconV2({
  symbolA,
  symbolB,
  customSize = 40,
  iconBStyle = tailwind("-ml-4"),
  testID,
}: PoolPairIconV2Props): JSX.Element {
  const IconA = getNativeIcon(symbolA);
  const IconB = getNativeIcon(symbolB);
  return (
    <View style={tailwind("flex-row")} testID={testID}>
      <IconA
        height={customSize}
        width={customSize}
        style={tailwind("relative z-10")}
      />
      <IconB height={customSize} width={customSize} style={iconBStyle} />
    </View>
  );
}
