import { tailwind } from "@tailwind";
import { ThemedTextV2 } from "@components/themed";
import { View } from "@components";
import { Platform } from "react-native";

export function TokenNameTextV2({
  testID,
  displaySymbol,
  name,
}: {
  testID: string;
  displaySymbol: string;
  name: string;
}): JSX.Element {
  return (
    <View style={tailwind("ml-2 flex-auto")}>
      <ThemedTextV2
        style={tailwind("font-semibold-v2 text-sm mb-1", {
          "mt-0.5": Platform.OS === "android",
        })}
        testID={`${testID}_symbol`}
      >
        {displaySymbol}
      </ThemedTextV2>
      {name !== "" && (
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
          style={tailwind("text-xs font-normal-v2")}
          numberOfLines={1}
          testID={`${testID}_name`}
          ellipsizeMode="tail"
        >
          {name}
        </ThemedTextV2>
      )}
    </View>
  );
}
