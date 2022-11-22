import { View } from "react-native";
import { useStyles } from "@tailwind";
import { translate } from "@translations";
import { ThemedViewV2 } from "@components/themed";
import { ButtonGroup } from "../../components/ButtonGroup";

export enum ButtonGroupTabKey {
  InstantSwap = "INSTANT_SWAP",
  FutureSwap = "FUTURE_SWAP",
}

interface SwapButtonGroupProps {
  activeButtonGroup: ButtonGroupTabKey;
  onPress: (type: ButtonGroupTabKey) => void;
  disableFutureSwap: boolean;
}

export function SwapButtonGroup({
  activeButtonGroup,
  onPress,
  disableFutureSwap = false,
}: SwapButtonGroupProps): JSX.Element {
  const { tailwind } = useStyles();
  const buttonGroup = [
    {
      id: ButtonGroupTabKey.InstantSwap,
      label: translate("screens/CompositeSwapScreen", "Instant"),
      handleOnPress: () => onPress(ButtonGroupTabKey.InstantSwap),
    },
    {
      id: ButtonGroupTabKey.FutureSwap,
      label: translate("screens/CompositeSwapScreen", "Future"),
      handleOnPress: () => onPress(ButtonGroupTabKey.FutureSwap),
      isDisabled: disableFutureSwap,
    },
  ];
  return (
    <ThemedViewV2
      light={tailwind("bg-mono-light-v2-00 border-mono-light-v2-100")}
      dark={tailwind("bg-mono-dark-v2-00 border-mono-dark-v2-100")}
      style={tailwind("flex flex-col items-center rounded-b-2xl-v2 border-b")}
    >
      <View style={tailwind("w-full px-5")}>
        <ButtonGroup
          buttons={buttonGroup}
          activeButtonGroupItem={activeButtonGroup}
          testID="swap_tabs"
          lightThemeStyle={tailwind("bg-transparent")}
          darkThemeStyle={tailwind("bg-transparent")}
        />
      </View>
    </ThemedViewV2>
  );
}
