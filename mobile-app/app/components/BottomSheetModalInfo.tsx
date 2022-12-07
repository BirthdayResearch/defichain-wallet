import { View } from "@components";
import { ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { memo } from "react";
import { Platform } from "react-native";

interface BottomSheetProps {
  title: string;
  description: string;
}

export const BottomSheetModalInfo = (
  props: BottomSheetProps
): React.MemoExoticComponent<() => JSX.Element> =>
  memo(() => {
    const { tailwind } = useStyles();
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
            testID="oracle_price_info_title"
          >
            {translate("components/BottomSheetInfo", props.title)}
          </ThemedTextV2>
        </View>
        <ThemedViewV2
          style={tailwind("border-t-0.5")}
          dark={tailwind("border-mono-dark-v2-300")}
          light={tailwind("border-mono-light-v2-300")}
          testID="oracle_price_info_description"
        >
          <ThemedTextV2 style={tailwind("mt-4 font-normal-v2")}>
            {translate("components/BottomSheetInfo", props.description)}
          </ThemedTextV2>
        </ThemedViewV2>
      </ThemedViewV2>
    );
  });
