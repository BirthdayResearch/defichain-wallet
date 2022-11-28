import { useStyles } from "@tailwind";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { StyleProp, ViewStyle } from "react-native";

interface LoanActionButtonProps {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID: string;
  disabled?: boolean;
}

export function LoanActionButton({
  label,
  onPress,
  style,
  testID,
  disabled,
}: LoanActionButtonProps): JSX.Element {
  const { tailwind } = useStyles();
  return (
    <ThemedTouchableOpacityV2
      style={[
        tailwind("rounded-2xl-v2 py-2 px-4 items-center justify-center"),
        style,
      ]}
      dark={tailwind("bg-mono-dark-v2-100", { "opacity-30": disabled })}
      light={tailwind("bg-mono-light-v2-100", { "opacity-30": disabled })}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 0.3 : 0.7}
      testID={`loans_action_button_${testID}`}
    >
      <ThemedTextV2
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
  onAdd?: () => void;
  onRemove?: () => void;
  token: string;
  leftDisabled?: boolean;
  rightDisabled?: boolean;
}

export function LoanAddRemoveActionButton({
  style,
  onAdd,
  onRemove,
  token,
  leftDisabled,
  rightDisabled,
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
        style={tailwind("border-r-0.5 pr-2", { "opacity-30": leftDisabled })}
        testID={`collateral_remove_${token}`}
        disabled={leftDisabled}
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
        style={tailwind("pl-2", { "opacity-30": rightDisabled })}
        testID={`collateral_add_${token}`}
        disabled={rightDisabled}
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
