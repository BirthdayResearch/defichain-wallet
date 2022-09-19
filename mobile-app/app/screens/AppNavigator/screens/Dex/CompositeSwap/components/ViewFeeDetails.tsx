import { View, Platform } from "react-native";
import { memo } from "react";
import { tailwind } from "@tailwind";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { translate } from "@translations";
import { NumberRowV2 } from "@components/NumberRowV2";

interface ViewPoolDetailsProps {
  feeData?: [];
}

export const ViewFeeDetails = ({
  feeData,
}: ViewPoolDetailsProps): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    return (
      <ThemedViewV2
        style={tailwind(
          "px-5 h-full flex flex-grow",
          { "-mt-0.5": Platform.OS === "ios" },
          { "-mt-1": Platform.OS === "android" }
        )}
      >
        {/* -mt-1 above and mt-1 added below is kind of hack to solved React Navigation elevation bug on android for now. */}
        <View
          style={tailwind(
            "mb-3 flex-row items-center",
            { "mt-1": Platform.OS === "ios" },
            { "mt-2": Platform.OS === "android" }
          )}
        >
          <ThemedTextV2
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            style={tailwind("pl-1 text-xl font-normal-v2")}
            testID="view_pool_details_title"
          >
            {translate("screens/ConvertConfirmScreen", "Fee breakdown")}
          </ThemedTextV2>
        </View>
        <FeeBreakdownDetails />
      </ThemedViewV2>
    );
  });

function FeeBreakdownDetails(): JSX.Element {
  return (
    <ThemedViewV2 style={tailwind("mt-5")}>
      <View style={tailwind("mb-5")}>
        <ThemedViewV2
          style={tailwind("border-b-0.5 mb-5")}
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
        >
          <ThemedTextV2
            light={tailwind("text-mono-light-v2-700")}
            dark={tailwind("text-mono-dark-v2-700")}
            style={tailwind("text-base font-normal-v2 mb-5")}
          >
            {translate(
              "screens/ConvertConfirmScreen",
              "The following fees will be charged based on the type of swap, and tokens selected."
            )}
          </ThemedTextV2>
        </ThemedViewV2>

        {/* Conditional display */}
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-700")}
          dark={tailwind("text-mono-dark-v2-700")}
          style={tailwind("text-sm font-normal-v2 mb-5")}
        >
          {translate("screens/ConvertConfirmScreen", "Decentralized Exchange")}
        </ThemedTextV2>

        {/*  With pool fee and stabilization fee */}
        {/*
          DEX
          Commission
          Pool
          Stablization
          --------
          Transaction (x)
          --------
          Total (x)
        */}

        {/* With pool fee only
          DEX
          Commission
          Pool
          --------
          Transaction (x)
          --------
          Total (x)
        */}

        {/* Standard fees
          Transaction (x)
          --------
          Total (x)
         */}
        <ThemedViewV2
          style={tailwind("border-b-0.5 mb-5")}
          light={tailwind("border-mono-light-v2-300")}
          dark={tailwind("border-mono-dark-v2-300")}
        >
          <NumberRowV2
            lhs={{
              value: translate("screens/ConvertConfirmScreen", "Transaction"),
              testID: "shares_to_add",
              themedProps: {
                light: tailwind("text-mono-light-v2-500"),
                dark: tailwind("text-mono-dark-v2-500"),
                style: tailwind("text-sm font-normal-v2 mb-5"),
              },
            }}
            rhs={{
              value: 696969,
              testID: "",
              suffix: " DFI",
            }}
            testID=""
          />
        </ThemedViewV2>

        <NumberRowV2
          lhs={{
            value: translate("screens/ConvertConfirmScreen", "Total"),
            testID: "shares_to_add",
            themedProps: {
              light: tailwind("text-mono-light-v2-500"),
              dark: tailwind("text-mono-dark-v2-500"),
              style: tailwind("text-sm font-normal-v2 mb-5"),
            },
          }}
          rhs={{
            value: 696969,
            testID: "",
            suffix: " DFI",
          }}
          testID=""
        />
        {/* TODO: map out a NumberRow for rhs to display list of swap fees */}
      </View>
    </ThemedViewV2>
  );
}
