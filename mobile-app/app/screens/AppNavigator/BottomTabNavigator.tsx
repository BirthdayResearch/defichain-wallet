import { Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getColor, tailwind } from "@tailwind";
import { translate } from "@translations";
import { OceanInterface } from "@components/OceanInterface/OceanInterface";
import {
  AuctionsIcon,
  DEXIcon,
  LoansIcon,
  PortfolioIcon,
} from "@screens/WalletNavigator/assets/BottomNavIcon";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { PortfolioNavigator } from "./screens/Portfolio/PortfolioNavigator";
import { DexNavigator } from "./screens/Dex/DexNavigator";
import { LoansNavigator } from "./screens/Loans/LoansNavigator";
import { AuctionsNavigator } from "./screens/Auctions/AuctionNavigator";

export interface BottomTabParamList {
  Portfolio: undefined;
  Dex: undefined;
  Settings: undefined;

  [key: string]: undefined | object;
}

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

const getTabBarLabel = ({
  focused,
  color,
  title,
}: {
  focused: boolean;
  color: string;
  title: string;
}): JSX.Element => (
  <Text style={{ color, ...tailwind("font-normal-v2 text-xs") }}>
    {focused ? title : ""}
  </Text>
);

export function BottomTabNavigator(): JSX.Element {
  const { isLight } = useThemeContext();
  return (
    <>
      <OceanInterface />

      <BottomTab.Navigator
        initialRouteName="Portfolio"
        screenOptions={{
          headerShown: false,
          tabBarLabelPosition: "below-icon",
          tabBarStyle: tailwind(
            "px-5 py-2 h-16 border-t",
            { "bg-mono-light-v2-00 border-mono-light-v2-100": isLight },
            { "bg-mono-dark-v2-00 border-mono-dark-v2-100": !isLight },
            { "pt-1 pb-4 h-24": Platform.OS === "ios" }
          ),
          tabBarActiveTintColor: getColor("brand-v2-500"),
          tabBarInactiveTintColor: isLight
            ? getColor("mono-light-v2-900")
            : getColor("mono-dark-v2-1000"),
          tabBarItemStyle: tailwind({ "pb-4 pt-2": Platform.OS === "ios" }),
        }}
      >
        <BottomTab.Screen
          component={PortfolioNavigator}
          name="Portfolio"
          options={{
            tabBarLabel: ({ focused, color }) =>
              getTabBarLabel({
                focused,
                color,
                title: translate("BottomTabNavigator", "Portfolio"),
              }),
            tabBarTestID: "bottom_tab_portfolio",
            tabBarIcon: ({ color }) => (
              <PortfolioIcon color={color} size={24} />
            ),
          }}
        />

        <BottomTab.Screen
          component={DexNavigator}
          name="DEX"
          options={{
            tabBarLabel: ({ focused, color }) =>
              getTabBarLabel({
                focused,
                color,
                title: translate("BottomTabNavigator", "DEX"),
              }),
            tabBarTestID: "bottom_tab_dex",
            tabBarIcon: ({ color }) => <DEXIcon color={color} size={24} />,
          }}
        />

        <BottomTab.Screen
          component={LoansNavigator}
          name="Loans"
          options={{
            tabBarLabel: ({ focused, color }) =>
              getTabBarLabel({
                focused,
                color,
                title: translate("BottomTabNavigator", "Loans"),
              }),
            tabBarTestID: "bottom_tab_loans",
            tabBarIcon: ({ color }) => <LoansIcon color={color} size={24} />,
          }}
        />

        <BottomTab.Screen
          component={AuctionsNavigator}
          name="Auctions"
          options={{
            tabBarLabel: ({ focused, color }) =>
              getTabBarLabel({
                focused,
                color,
                title: translate("BottomTabNavigator", "Auctions"),
              }),
            tabBarTestID: "bottom_tab_auctions",
            tabBarIcon: ({ color }) => <AuctionsIcon color={color} size={24} />,
          }}
        />
      </BottomTab.Navigator>
    </>
  );
}

export const AppLinking = {
  Portfolio: {
    screens: {
      PortfolioScreen: "portfolio",
    },
  },
  Dex: {
    screens: {
      DexScreen: "dex",
    },
  },
  Settings: {
    screens: {
      SettingsScreen: "settings",
      PlaygroundScreen: "settings/playground",
    },
  },
};
