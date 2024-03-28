import { StatusBar } from "expo-status-bar";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { useThemeContext } from "@waveshq/walletkit-ui";
import { useEffect } from "react";
import { WalletAlert } from "@components/WalletAlert";
import { translate } from "@translations";
import { RootNavigator } from "./RootNavigator";

export function Main(): JSX.Element {
  const { isLight } = useThemeContext();
  useEffect(() => {
    WalletAlert({
      title: translate(
        "screens/AnalyticsScreen",
        "Data is now collected to improve experience.",
      ),
      message: translate(
        "screens/AnalyticsScreen",
        "As of the latest version, this wallet is now collecting non-identifiable performance-related data. You can choose to opt-out anytime from the settings page.",
      ),
      buttons: [
        {
          text: translate("screens/AnalyticsScreen", "Continue"),
          style: "cancel",
        },
      ],
    });
  }, []);
  return (
    <SafeAreaProvider>
      <RootNavigator />

      <StatusBar style={isLight ? "dark" : "light"} />
    </SafeAreaProvider>
  );
}
