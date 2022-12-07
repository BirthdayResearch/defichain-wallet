import { ThemedIcon, ThemedTextV2, ThemedViewV2 } from "@components/themed";
import { useStyles } from "@tailwind";
import { TouchableOpacity } from "react-native";

export function BottomSheetTokenListHeader({
  headerLabel,
  onCloseButtonPress,
}: {
  headerLabel: string;
  onCloseButtonPress: () => void;
}): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2 style={tailwind("pt-6 pb-3 rounded-t-xl-v2 border-b-0")}>
      <ThemedViewV2
        style={tailwind("flex flex-row justify-between items-center mx-5")}
      >
        <ThemedTextV2
          style={tailwind("text-xl font-normal-v2")}
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
        >
          {headerLabel}
        </ThemedTextV2>
        <TouchableOpacity onPress={onCloseButtonPress}>
          <ThemedIcon
            iconType="Feather"
            name="x-circle"
            size={20}
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
          />
        </TouchableOpacity>
      </ThemedViewV2>
    </ThemedViewV2>
  );
}
