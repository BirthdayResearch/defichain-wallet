import { StackNavigationOptions } from "@react-navigation/stack";
import { tailwind } from "@tailwind";
import { Dimensions, Platform, StyleProp, ViewStyle } from "react-native";
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
}

export function useNavigatorHeaderStylesOption(
  props: NavigatorHeaderProps
): StackNavigationOptions {
  const insets = useSafeAreaInsets();
  const screenOptions = useNavigatorScreenOptions();
  const navigation = useNavigation<NavigationProp<LoanParamList>>();
  const goToNetworkSelect = (): void => {
    navigation.navigate("NetworkSelectionScreen");
  };
  const { width } = Dimensions.get("window");

  return {
    headerLeft: undefined,
    headerTitleAlign: "left",
    headerTitleContainerStyle: {
      width: width - (Platform.OS === "ios" ? 200 : 180),
    },
    headerRightContainerStyle: [
      screenOptions.headerRightContainerStyle,
      tailwind("justify-start", {
        "pr-3": Platform.OS === "web",
      }),
    ],
    headerLeftContainerStyle: tailwind("pl-1"),
    headerStyle: [
      screenOptions.headerStyle,
      tailwind("rounded-b-none border-b-0"),
      {
        shadowOpacity: 0,
        height: 76 + insets.top,
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
        containerStyle={tailwind("pt-5")}
      />
    ),
  };
}
