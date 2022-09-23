import { tailwind } from "@tailwind";
import {
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import { StyleProp, ViewStyle } from "react-native";

interface LoanActionButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID: string;
  disabled?: boolean;
  iconLeft?: () => JSX.Element;
}

export function LoanActionButton({
  label,
  onPress,
  style,
  testID,
  disabled,
  iconLeft,
}: LoanActionButtonProps): JSX.Element {
  return (
    <ThemedTouchableOpacityV2
      style={[
        tailwind("rounded-2xl-v2 py-2 px-4 items-center justify-center", {
          "flex flex-row items-center": iconLeft,
        }),
        style,
      ]}
      dark={tailwind("bg-mono-dark-v2-100", { "opacity-30": disabled })}
      light={tailwind("bg-mono-light-v2-100", { "opacity-30": disabled })}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 0.3 : 0.7}
      testID={`loans_action_button_${testID}`}
    >
      {iconLeft?.()}
      <ThemedTextV2
        light={tailwind("text-mono-light-v2-900")}
        dark={tailwind("text-mono-dark-v2-900")}
        style={tailwind("font-semibold-v2 text-sm text-center")}
        testID={testID}
      >
        {label}
      </ThemedTextV2>
    </ThemedTouchableOpacityV2>
  );
}
