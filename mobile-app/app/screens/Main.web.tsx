import { NavigationContainer } from "@react-navigation/native";
import { Theme } from "@react-navigation/native/lib/typescript/src/types";

import { StyleSheet, View } from "react-native";
import { useStyles } from "@tailwind";
import { EnvironmentName, getEnvironment } from "@environment";
import { getReleaseChannel } from "@api/releaseChannel";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./RootNavigator";
import { PlaygroundNavigator } from "./PlaygroundNavigator/PlaygroundNavigator";

export function Main(): JSX.Element {
  const env = getEnvironment(getReleaseChannel());
  const { tailwind, getDefaultTheme } = useStyles();
  const DeFiChainTheme: Theme = getDefaultTheme();

  return (
    <SafeAreaProvider>
      <View
        style={tailwind("flex-row flex-1 justify-center items-center bg-black")}
      >
        <View style={styles.phone}>
          <RootNavigator />
        </View>

        {env.name !== EnvironmentName.Production && (
          <View style={[styles.phone, tailwind("bg-white ml-2")]}>
            <NavigationContainer theme={DeFiChainTheme}>
              <PlaygroundNavigator />
            </NavigationContainer>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

/**
 * iPhone 8 Size
 */
const styles = StyleSheet.create({
  phone: {
    height: 667,
    width: 375,
  },
});
