import { BottomSheetAlertInfo } from "@components/BottomSheetInfo";
import { NumberRow, NumberRowElement } from "@components/NumberRow";
import { NumberRowV2 } from "@components/NumberRowV2";
import { ThemedProps, ThemedTextV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { NumericFormat as NumberFormat } from "react-number-format";

import { Text, ViewProps } from "react-native";

type IVaultSectionTextProps = React.PropsWithChildren<ViewProps> &
  VaultSectionTextProps;
interface VaultSectionTextProps extends NumberRowElement {
  lhs: string;
  info?: BottomSheetAlertInfo;
  rhsThemedProps?: ThemedProps;
  isOraclePrice?: boolean;
}
// TODO @chloe: clean up

export function VaultSectionTextRowV2(
  props: IVaultSectionTextProps
): JSX.Element {
  return (
    <>
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-700")}
        dark={tailwind("text-mono-light-v2-700")}
        style={tailwind("text-xs font-normal-v2 mt-2")}
      >
        {props.lhs}
      </ThemedTextV2>
      <NumberFormat
        decimalScale={8}
        displayType="text"
        prefix={props.prefix}
        renderText={(val: string) => (
          <Text>
            <ThemedTextV2
              dark={tailwind("text-mono-dark-v2-900")}
              light={tailwind("text-mono-light-v2-900")}
              style={tailwind("text-xs font-normal-v2")}
              // testID={props.rhs.testID}
              {...props.rhsThemedProps}
            >
              {val}
            </ThemedTextV2>
            {/* {props.rhs.suffixType === "text" && ( */}
            <>
              <ThemedTextV2
                light={tailwind("text-gray-500")}
                dark={tailwind("text-gray-400")}
                // style={[
                //   tailwind("text-sm ml-1"),
                //   props.textStyle,
                //   props.rhs.style,
                // ]}
                // testID={`${props.rhs.testID}_suffix`}
                {...props.rhsThemedProps}
              >
                {props.suffix}
              </ThemedTextV2>
            </>
            {/* )} */}
          </Text>
        )}
        thousandSeparator
        value={props.value}
      />
    </>
  );
}
