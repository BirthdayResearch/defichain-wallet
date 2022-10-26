import { StackNavigationOptions } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { Platform, StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedTextV2 } from "@components/themed";
import { translate } from "@translations";
import { HeaderNetworkStatus } from "@components/HeaderNetworkStatus";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LoanParamList } from "@screens/AppNavigator/screens/Loans/LoansNavigator";
import { useNavigatorScreenOptions } from "../../../hooks/useNavigatorScreenOptions";

interface NavigatorHeaderProps {
  destination: string;
  headerTitle: string;
  networkScreenPath?: string;
  headerTitleContainerStyle?: StyleProp<ViewStyle>;
}

export function useNavigatorHeaderStylesOption(
  props: NavigatorHeaderProps
): StackNavigationOptions {
  const insets = useSafeAreaInsets();
  const screenOptions = useNavigatorScreenOptions();
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const goToNetworkSelect = (): void => {
    navigation.navigate(
      props.networkScreenPath
        ? props.networkScreenPath
        : "NetworkSelectionScreenPortfolio"
    );
  };

  return {
    headerLeft: undefined,
    headerLeftContainerStyle: null,
    headerTitleAlign: "left",
    headerTitleContainerStyle:
      props.headerTitleContainerStyle ?? tailwind("mt-4 ml-5"),
    headerRightContainerStyle: [
      screenOptions.headerRightContainerStyle,
      tailwind("mt-5 justify-start", { "pr-5": Platform.OS === "web" }),
    ],
    headerStyle: [
      screenOptions.headerStyle,
      tailwind("rounded-b-none border-b-0"),
      {
        shadowOpacity: 0,
        height: (Platform.OS !== "android" ? 88 : 96) + insets.top,
      },
    ],
    headerTitle: () => (
      <ThemedTextV2
        style={[
          screenOptions.headerTitleStyle as Array<StyleProp<ViewStyle>>,
          tailwind("text-left text-3xl font-semibold-v2"),
          // eslint-disable-next-line react-native/no-inline-styles
          { fontSize: 28 },
        ]}
      >
        {translate(props.destination, props.headerTitle)}
      </ThemedTextV2>
    ),
    headerRight: () => (
      <HeaderNetworkStatus
        onPress={goToNetworkSelect}
        // containerStyle={tailwind({
        //   "pt-5": Platform.OS === "android",
        // })}
      />
    ),
  };
}
