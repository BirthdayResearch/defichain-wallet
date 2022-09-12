import { View } from "@components";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { memo } from "react";
import { Platform } from "react-native";

export const BottomSheetSlippageInfo = (): React.MemoExoticComponent<
  () => JSX.Element
> =>
  memo(() => {
    const description =
      "Slippages are rate charges that occur within an order transaction. Note that the slippage tolerance also includes the DEX stablization fees. Choose how much of this slippage you are willing to accept.";
    return (
      <ThemedViewV2
        style={tailwind(
          "px-5 h-full",
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
            {translate("screens/CompositeSwapScreen", "Slippage Tolerance")}
          </ThemedTextV2>
        </View>
        <ThemedViewV2
          style={tailwind("border-t-0.5")}
          dark={tailwind("border-mono-dark-v2-300")}
          light={tailwind("border-mono-light-v2-300")}
        >
          <ThemedTextV2 style={tailwind("mt-4 font-normal-v2")}>
            {description}
          </ThemedTextV2>
        </ThemedViewV2>
      </ThemedViewV2>
    );
  });
