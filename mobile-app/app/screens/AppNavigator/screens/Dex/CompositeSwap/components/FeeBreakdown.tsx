import { View } from "react-native";
import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { translate } from "@translations";

interface FeeBreakdownProps {
  testID?: string;
  onPress: () => void;
}

export function FeeBreakdown({
  onPress,
  testID,
}: FeeBreakdownProps): JSX.Element {
  return (
    <View style={tailwind("items-center")}>
      <ThemedTouchableOpacityV2
        style={tailwind("flex-row")}
        onPress={onPress}
        testID={testID}
      >
        <ThemedIcon
          size={16}
          name="info-outline"
          iconType="MaterialIcons"
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
        />
        <ThemedTextV2
          dark={tailwind("text-mono-dark-v2-700")}
          light={tailwind("text-mono-light-v2-700")}
          style={tailwind("ml-1 text-xs font-semibold-v2")}
        >
          {translate("screens/ConfirmCompositeSwapScreen", "Fee breakdown")}
        </ThemedTextV2>
      </ThemedTouchableOpacityV2>
    </View>
  );
}
