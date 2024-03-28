import {
  ThemedScrollViewV2,
  ThemedSectionTitleV2,
  ThemedTextV2,
  ThemedViewV2,
} from "@components/themed";
import { WalletAlert } from "@components/WalletAlert";
import { translate } from "@translations";
import { tailwind } from "@tailwind";
import { Switch } from "@components";
import { useAnalytics } from "@shared-contexts/AnalyticsProvider";

export function AnalyticsScreen(): JSX.Element {
  const { isAnalyticsOn, toggleAnalytics } = useAnalytics();

  return (
    <ThemedScrollViewV2
      style={tailwind("flex-1")}
      contentContainerStyle={tailwind("px-5 pb-16")}
      testID="analytics_screen"
    >
      <ThemedSectionTitleV2
        testID="analytics_screen_title"
        text={translate("screens/AnalyticsScreen", "ANALYTICS")}
      />
      <ThemedViewV2
        style={tailwind(
          "flex flex-row items-center justify-between rounded-lg-v2 px-5 py-3",
        )}
        dark={tailwind("bg-mono-dark-v2-00")}
        light={tailwind("bg-mono-light-v2-00")}
      >
        <ThemedTextV2
          light={tailwind("text-mono-light-v2-900")}
          dark={tailwind("text-mono-dark-v2-900")}
          style={tailwind("font-normal-v2 text-sm flex-1")}
          testID="text_privacy_lock"
        >
          {translate("screens/AnalyticsScreen", "Allow data access")}
        </ThemedTextV2>
        <Switch
          onValueChange={async () => {
            if (isAnalyticsOn) {
              WalletAlert({
                title: translate(
                  "screens/AnalyticsScreen",
                  "Are you sure you want to restrict data access?",
                ),
                message: translate(
                  "screens/AnalyticsScreen",
                  "Your data is always kept anonymous and is used only for improvements. Are you sure you want to restrict?",
                ),
                buttons: [
                  {
                    text: translate("screens/AnalyticsScreen", "Cancel"),
                    style: "cancel",
                  },
                  {
                    text: translate("screens/AnalyticsScreen", "Restrict data"),
                    onPress: async () => {
                      toggleAnalytics();
                    },
                    style: "destructive",
                  },
                ],
              });
            } else {
              toggleAnalytics();
            }
          }}
          value={isAnalyticsOn}
        />
      </ThemedViewV2>
      <ThemedTextV2
        dark={tailwind("text-mono-dark-v2-500")}
        light={tailwind("text-mono-light-v2-500")}
        style={tailwind("px-5 pt-2 text-xs font-normal-v2")}
      >
        {translate(
          "screens/AnalyticsScreen",
          "Participate in BR Analytics to help us make DeFiChain Wallet better.",
        )}
      </ThemedTextV2>
    </ThemedScrollViewV2>
  );
}
