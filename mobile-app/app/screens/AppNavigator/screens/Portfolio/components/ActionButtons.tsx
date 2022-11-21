import {
  IconName,
  IconType,
  ThemedIcon,
  ThemedTextV2,
  ThemedTouchableOpacityV2,
} from "@components/themed";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootState } from "@store";
import { futureSwapSelector } from "@store/futureSwap";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { ScrollView, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { getNativeIcon } from "@components/icons/assets";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { PortfolioParamList } from "../PortfolioNavigator";

export interface ActionButtonsProps {
  name: string;
  icon?: IconName;
  iconType?: IconType;
  iconSize?: number;
  onPress: () => void;
  testID: string;
  badge?: string | number;
}

export function ActionButtons(): JSX.Element {
  const { isFeatureAvailable } = useFeatureFlagContext();
  const navigation = useNavigation<NavigationProp<PortfolioParamList>>();
  const futureSwaps = useSelector((state: RootState) =>
    futureSwapSelector(state)
  );

  return (
    <View testID="action_button_group">
      <ScrollView
        contentContainerStyle={tailwind(
          "flex justify-between min-w-full px-5 mt-8"
        )}
        showsHorizontalScrollIndicator={false}
        horizontal
      >
        <ActionButton
          name={translate("components/ActionButtons", "Get DFI")}
          iconSize={28}
          testID="get_DFI_btn"
          onPress={() => navigation.navigate("GetDFIScreen")}
        />
        <ActionButton
          name={translate("components/ActionButtons", "Send")}
          icon="arrow-up-right"
          iconType="Feather"
          iconSize={28}
          testID="send_balance_button"
          onPress={() => {
            navigation.navigate({
              name: "TokenSelectionScreen",
              params: {},
              merge: true,
            });
          }}
        />
        <ActionButton
          name={translate("components/ActionButtons", "Receive")}
          icon="arrow-down-left"
          iconType="Feather"
          iconSize={28}
          testID="receive_balance_button"
          onPress={() => navigation.navigate("Receive")}
        />
        {isFeatureAvailable("future_swap") && futureSwaps.length > 0 && (
          <ActionButton
            name={translate("components/ActionButtons", "Future swap")}
            icon="clock"
            iconType="Feather"
            badge={futureSwaps.length > 9 ? "9+" : futureSwaps.length}
            testID="future_swap_button"
            onPress={() => navigation.navigate("FutureSwapScreen")}
          />
        )}
        <ActionButton
          name={translate("components/ActionButtons", "Swap")}
          icon="repeat"
          iconType="Feather"
          testID="swap_tokens_button"
          onPress={() =>
            navigation.navigate({
              name: "CompositeSwap",
              params: {},
              merge: true,
            })
          }
        />
        <ActionButton
          name={translate("components/ActionButtons", "Transactions")}
          icon="calendar"
          testID="transaction_button"
          iconType="Feather"
          onPress={() => navigation.navigate("TransactionsScreen")}
        />
      </ScrollView>
    </View>
  );
}

function ActionButton(props: ActionButtonsProps): JSX.Element {
  const DFIIcon = getNativeIcon("DFIlogo");
  const { isLight } = useThemeContext();
  return (
    <View style={tailwind("items-center")}>
      <ThemedTouchableOpacityV2
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
        style={tailwind(
          "rounded-full w-15 h-15 items-center justify-center mx-2.5"
        )}
        onPress={props.onPress}
        testID={props.testID}
      >
        {props.iconType === undefined ? (
          isLight ? (
            <DFIIcon width={20} height={20} color="#000" />
          ) : (
            <DFIIcon width={20} height={20} color="#FFF" />
          )
        ) : (
          <ThemedIcon
            dark={tailwind("text-mono-dark-v2-900")}
            light={tailwind("text-mono-light-v2-900")}
            iconType={props.iconType}
            name={props.icon}
            size={props.iconSize ?? 24}
          />
        )}

        {props.badge !== undefined && (
          <View
            style={tailwind(
              "bg-red-v2 rounded-full items-center justify-center h-4 w-4 absolute top-0 right-0"
            )}
          >
            <Text
              style={tailwind("text-2xs font-bold-v2 text-mono-dark-v2-900")}
            >
              {props.badge}
            </Text>
          </View>
        )}
      </ThemedTouchableOpacityV2>
      <ThemedTextV2 style={tailwind("text-xs font-normal-v2 text-center mt-2")}>
        {props.name}
      </ThemedTextV2>
    </View>
  );
}
