import { Platform, View } from "react-native";
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedTouchableOpacityV2,
  ThemedViewV2,
} from "@components/themed";
import {
  SkeletonLoader,
  SkeletonLoaderScreen,
} from "@components/SkeletonLoader";
import { useEffect } from "react";
import { batch, useSelector } from "react-redux";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { getColor, tailwind } from "@tailwind";
import { Text } from "@components";
import { RootState } from "@store";
import { fetchLoanSchemes, fetchLoanTokens, fetchVaults } from "@store/loans";
import { useWhaleApiClient } from "@shared-contexts/WhaleContext";
import { useWalletContext } from "@shared-contexts/WalletContext";
import { LoanToken } from "@defichain/whale-api-client/dist/api/loan";
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useThemeContext } from "@shared-contexts/ThemeProvider";
import { useAppDispatch } from "@hooks/useAppDispatch";
import { translate } from "@translations";

import {
  BottomSheetNavScreen,
  BottomSheetWebWithNavV2,
  BottomSheetWithNavV2,
} from "@components/BottomSheetWithNavV2";
import { LoansCarousel } from "@screens/WalletNavigator/screens/components/LoansCarousel";
import { useBottomSheet } from "@hooks/useBottomSheet";
import { LoanCardsV2 } from "./components/LoanCardsV2";
import { VaultsV2 } from "./components/VaultsV2";
import { ButtonGroupV2 } from "../Dex/components/ButtonGroupV2";
import { VaultStatus } from "./VaultStatusTypes";
import { LoanParamList } from "./LoansNavigator";
import { VaultBanner } from "./components/VaultBanner";
import { PriceOracleInfo } from "./components/PriceOracleInfo";
import { BottomSheetModalInfo } from "../../../../components/BottomSheetModalInfo";

const LoansTab = createMaterialTopTabNavigator();

enum TabKey {
  Borrow = "BORROW",
  YourVaults = "YOUR_VAULTS",
}

export function LoansScreenV2(): JSX.Element {
  const { address } = useWalletContext();
  const { isLight } = useThemeContext();
  const navigation = useNavigation<NavigationProp<LoanParamList>>();

  const isFocused = useIsFocused();
  const blockCount = useSelector((state: RootState) => state.block.count);
  const dispatch = useAppDispatch();
  const client = useWhaleApiClient();

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchVaults({ address, client }));
        dispatch(fetchLoanTokens({ client }));
      });
    }
  }, [blockCount, address, isFocused]);

  useEffect(() => {
    dispatch(fetchLoanSchemes({ client }));
  }, []);

  return (
    <LoansTab.Navigator
      screenOptions={{
        swipeEnabled: false,
        tabBarLabelStyle: [
          tailwind("font-semibold-v2 text-sm text-center", {
            "text-mono-light-v2-900": isLight,
            "text-mono-dark-v2-900": !isLight,
          }),
          {
            textTransform: "none",
          },
        ],
        tabBarActiveTintColor: getColor("brand-v2-500"),
        tabBarPressColor: "transparent",
        tabBarIndicatorStyle: {
          borderBottomWidth: 2,
          borderColor: getColor("brand-v2-500"),
          width: "40%",
          left: "5%",
        },
        tabBarInactiveTintColor: getColor(
          isLight ? "mono-light-v2-900" : "mono-dark-v2-900"
        ),
        tabBarStyle: [
          {
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            overflow: "hidden",
          },
          tailwind({
            "bg-mono-light-v2-00": isLight,
            "bg-mono-dark-v2-00": !isLight,
          }),
        ],
      }}
    >
      <LoansTab.Screen
        name={TabKey.Borrow}
        component={LoanCardsV2}
        options={{
          tabBarLabel: (props) => (
            <Text
              style={[
                tailwind("font-semibold-v2 text-sm text-center"),
                { color: props.color },
              ]}
            >
              {translate("components/tabs", "Borrow")}
            </Text>
          ),
          tabBarTestID: `loans_tabs_${TabKey.Borrow}`,
        }}
      />
      <LoansTab.Screen
        name={TabKey.YourVaults}
        component={VaultsV2}
        options={{
          tabBarLabel: (props) => (
            <Text
              style={[
                tailwind("font-semibold-v2 text-sm text-center"),
                { color: props.color },
              ]}
            >
              {translate("components/tabs", "Your vaults")}
            </Text>
          ),
          tabBarTestID: `loans_tabs_${TabKey.YourVaults}`,
        }}
      />
    </LoansTab.Navigator>
  );
}
