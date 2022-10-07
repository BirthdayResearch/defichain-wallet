import { BottomSheetAlertInfo } from "@components/BottomSheetInfo";
import { NumberRowElement } from "@components/NumberRow";
import { ThemedProps, ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { NumericFormat as NumberFormat } from "react-number-format";

import { View, ViewProps } from "react-native";

type IVaultSectionTextProps = React.PropsWithChildren<ViewProps> &
  VaultSectionTextProps;

interface VaultSectionTextProps extends NumberRowElement {
  lhs: string;
  info?: BottomSheetAlertInfo;
  rhsThemedProps?: ThemedProps;
  isOraclePrice?: boolean;
  testID: string;
  customContainerStyle?: string;
}

export function VaultSectionTextRowV2(
  props: IVaultSectionTextProps
): JSX.Element {
  return (
    <View style={tailwind(props.customContainerStyle)}>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-dark-v2-700")}
        style={tailwind("text-xs font-normal-v2")}
        testID={`${props.testID}_label`}
      >
        {props.lhs}
      </ThemedTextV2>
      <NumberFormat
        decimalScale={8}
        displayType="text"
        prefix={props.prefix}
        renderText={(val: string) => (
          <>
            <ThemedTextV2
              dark={tailwind("text-mono-dark-v2-900")}
              light={tailwind("text-mono-light-v2-900")}
              style={tailwind("text-xs font-normal-v2")}
              testID={`${props.testID}_amount`}
              {...props.rhsThemedProps}
            >
              {val}
            </ThemedTextV2>
            {props.suffix && (
              <ThemedTextV2
                dark={tailwind("text-mono-dark-v2-900")}
                light={tailwind("text-mono-light-v2-900")}
                testID={`${props.testID}_suffix`}
                {...props.rhsThemedProps}
              >
                {props.suffix}
              </ThemedTextV2>
            )}
          </>
        )}
        thousandSeparator
        value={props.value}
      />
    </View>
  );
}
