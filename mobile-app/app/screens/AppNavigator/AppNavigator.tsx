import * as Linking from "expo-linking";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { Theme } from "@react-navigation/native/lib/typescript/src/types";
import { createStackNavigator } from "@react-navigation/stack";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { getDefaultTheme } from "@constants/Theme";
import { PlaygroundNavigator } from "../PlaygroundNavigator/PlaygroundNavigator";
import { AppLinking, BottomTabNavigator } from "./BottomTabNavigator";

const App = createStackNavigator<AppParamList>();

export interface AppParamList {
  App: undefined;
  Playground: undefined;
  NotFound: undefined;

  [key: string]: undefined | object;
}

export function AppNavigator(): JSX.Element {
  const { isLight } = useThemeContext();
  const DeFiChainTheme: Theme = getDefaultTheme(isLight);

  return (
    <NavigationContainer linking={LinkingConfiguration} theme={DeFiChainTheme}>
      <App.Navigator screenOptions={{ headerShown: false }}>
        <App.Screen component={BottomTabNavigator} name="App" />

        <App.Screen component={PlaygroundNavigator} name="Playground" />
      </App.Navigator>
    </NavigationContainer>
  );
}

const LinkingConfiguration: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      App: {
        path: "app",
        screens: AppLinking,
      },
      Playground: {
        screens: {
          PlaygroundScreen: "playground",
        },
      },
    },
  },
};
