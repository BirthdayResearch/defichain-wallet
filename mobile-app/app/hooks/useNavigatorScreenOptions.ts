import { StackNavigationOptions } from "@react-navigation/stack";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { tailwind } from "@tailwind";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  isRounded?: boolean;
}

export function useNavigatorScreenOptions(
  props: Props = {}
): StackNavigationOptions {
  const { isLight } = useThemeContext();
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();

  return {
    headerTitleStyle: tailwind("font-normal-v2 text-xl text-center"),
    headerTitleContainerStyle: {
      width: width - (Platform.OS === "ios" ? 200 : 180),
    },
    headerTitleAlign: "center",
    headerBackTitleVisible: false,
    headerRightContainerStyle: tailwind("pr-5 pb-2"),
    headerLeftContainerStyle: tailwind("pl-5 relative", {
      "right-2": Platform.OS === "ios",
      "right-5": Platform.OS !== "ios",
    }),
    headerStyle: [
      tailwind({
        "bg-mono-light-v2-00": isLight,
        "bg-mono-dark-v2-00": !isLight,
        "rounded-b-2xl border-b": props.isRounded !== undefined,
        "border-mono-light-v2-00": isLight && props.isRounded !== undefined,
        "border-mono-dark-v2-100": !isLight && props.isRounded !== undefined,
        "rounded-b-none border-b-0": props.isRounded === undefined,
      }),
      {
        height: (Platform.OS !== "android" ? 88 : 96) + insets.top,
        shadowOpacity: 0,
      },
    ],
    headerBackgroundContainerStyle: tailwind({
      "bg-mono-light-v2-100": isLight,
      "bg-mono-dark-v2-100": !isLight,
    }),
  };
}
