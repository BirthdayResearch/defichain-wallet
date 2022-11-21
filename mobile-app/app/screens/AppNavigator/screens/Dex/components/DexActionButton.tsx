import { useStyles } from "@tailwind";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { StyleProp, ViewStyle } from "react-native";

interface DexActionButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID: string;
  disabled?: boolean;
}

export function DexActionButton({
  label,
  onPress,
  style,
  testID,
  disabled,
}: DexActionButtonProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedTouchableOpacityV2
      style={[tailwind("rounded-2xl-v2 py-2 px-4"), style]}
      dark={tailwind("bg-mono-dark-v2-100", { "opacity-30": disabled })}
      light={tailwind("bg-mono-light-v2-100", { "opacity-30": disabled })}
      onPress={disabled ? undefined : onPress} // using this instead of "disable" to prevent parent to be clickable
      activeOpacity={disabled ? 0.3 : 0.7}
      testID={`dex_action_button_${testID}`}
    >
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-900")}
        dark={tailwind("text-mono-dark-v2-900")}
        style={tailwind("font-semibold-v2 text-xs text-center")}
        testID={testID}
      >
        {label}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}

interface DexAddRemoveLiquidityButtonProps {
  style?: StyleProp<ViewStyle>;
  onAdd: () => void;
  onRemove: () => void;
  pairToken: string;
}

export function DexAddRemoveLiquidityButton({
  style,
  onAdd,
  onRemove,
  pairToken,
}: DexAddRemoveLiquidityButtonProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedViewV2
      style={[
        tailwind("rounded-2xl-v2 py-2 px-3 flex flex-row items-center"),
        style,
      ]}
      dark={tailwind("bg-mono-dark-v2-100")}
      light={tailwind("bg-mono-light-v2-100")}
    >
      <ThemedTouchableOpacityV2
        onPress={onRemove}
        style={tailwind("border-r-0.5 pr-2")}
        testID={`pool_pair_remove_${pairToken}`}
      >
        <ThemedIcon
          iconType="Feather"
          name="minus-circle"
          size={20}
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
        />
      </ThemedTouchableOpacityV2>
      <ThemedTouchableOpacityV2
        onPress={onAdd}
        style={tailwind("pl-2")}
        testID={`pool_pair_add_${pairToken}`}
      >
        <ThemedIcon
          iconType="Feather"
          name="plus-circle"
          size={20}
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
        />
      </ThemedTouchableOpacityV2>
    </ThemedViewV2>
  );
}
