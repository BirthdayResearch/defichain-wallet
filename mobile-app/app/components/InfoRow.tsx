import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { StyleProp, View, ViewStyle } from "react-native";
import { NumericFormat as NumberFormat } from "react-number-format";
import { BottomSheetInfo } from "@components/BottomSheetInfo";
import { ThemedProps, ThemedText, ThemedView } from "./themed";

interface InfoRowProps {
  value: string | number;
  type: InfoType;
  suffixType?: "text" | "component";
  suffix?: string | React.ReactElement<any>;
  testID: string;
  lhsThemedProps?: ThemedProps;
  rhsThemedProps?: ThemedProps;
  containerStyle?: ThemedProps & { style: StyleProp<ViewStyle> };
}
export enum InfoType {
  EstimatedFee,
  VaultFee,
  ExecutionBlock,
}

export function InfoRow(props: InfoRowProps): JSX.Element {
  const alertInfo = new Map([
    [
      InfoType.EstimatedFee,
      {
        title: "Estimated fee",
        message:
          "Each transaction will be subject to a small amount of fees. The amount may vary depending on the network’s congestion.",
      },
    ],
    [
      InfoType.VaultFee,
      {
        title: "Vault fee",
        message:
          "This fee serves as initial deposit for your vault. You will receive 1 DFI back when you choose to close this vault.",
      },
    ],
    [
      InfoType.ExecutionBlock,
      {
        title: "Settlement block",
        message:
          "The block height at which the future swap transaction will be executed.",
      },
    ],
  ]);

  return (
    <ThemedView
      dark={
        props.containerStyle?.dark ??
        tailwind("bg-gray-800 border-b border-gray-700")
      }
      light={
        props.containerStyle?.light ??
        tailwind("bg-white border-b border-gray-200")
      }
      style={
        props.containerStyle?.style ??
        tailwind("p-4 flex-row items-start w-full")
      }
    >
      <View style={tailwind("w-5/12")}>
        <View style={tailwind("flex-row items-center justify-start")}>
          <ThemedText
            style={tailwind("text-sm mr-1")}
            testID={`${props.testID}_label`}
            {...props.lhsThemedProps}
          >
            {translate(
              "components/BottomSheetInfo",
              alertInfo.get(props.type)?.title ?? ""
            )}
          </ThemedText>
          <BottomSheetInfo
            alertInfo={alertInfo.get(props.type)}
            name={alertInfo.get(props.type)?.title}
          />
        </View>
      </View>

      <View
        style={tailwind("flex-1 flex-row justify-end flex-wrap items-center")}
      >
        <NumberFormat
          decimalScale={8}
          displayType="text"
          renderText={(val: string) => (
            <ThemedText
              dark={tailwind("text-gray-400")}
              light={tailwind("text-gray-500")}
              style={tailwind("text-sm text-right")}
              testID={props.testID}
              {...props.rhsThemedProps}
            >
              {val}
            </ThemedText>
          )}
          thousandSeparator
          value={props.value}
        />
        {typeof props.suffix === "string" ? (
          <ThemedText
            light={tailwind("text-gray-500")}
            dark={tailwind("text-gray-400")}
            style={tailwind("text-sm ml-1")}
            testID={`${props.testID}_suffix`}
            {...props.rhsThemedProps}
          >
            {props.suffix}
          </ThemedText>
        ) : (
          typeof props.suffix !== "undefined" && props.suffix
        )}
      </View>
    </ThemedView>
  );
}
