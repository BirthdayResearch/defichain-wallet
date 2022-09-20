import {
  ThemedScrollViewV2,
  ThemedText,
  ThemedTextV2,
  ThemedView,
} from "@components/themed";
import { Switch } from "@components/index";
import { tailwind } from "@tailwind";
import { translate } from "@translations";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { FeatureFlag, FEATURE_FLAG_ID } from "@shared-types/website";
import { useFeatureFlagContext } from "@contexts/FeatureFlagContext";
import { WalletAlert } from "@components/WalletAlert";

export interface BetaFeaturesI extends FeatureFlag {
  value: boolean;
}

export function FeatureFlagScreen(): JSX.Element {
  const { featureFlags, enabledFeatures, updateEnabledFeatures } =
    useFeatureFlagContext();
  const [betaFeatures, setBetaFeatures] = useState<BetaFeaturesI[]>([]);

  const getBetaFeature = (flags: FEATURE_FLAG_ID[]): BetaFeaturesI[] => {
    return featureFlags.reduce(
      (features: BetaFeaturesI[], item: FeatureFlag) => {
        if (item.stage === "beta") {
          features.push({
            ...item,
            value: flags.includes(item.id),
          });
        }
        return features;
      },
      []
    );
  };

  useEffect(() => {
    setBetaFeatures(getBetaFeature(enabledFeatures));
  }, []);

  const onFeatureChange = async (
    feature: FeatureFlag,
    value: boolean
  ): Promise<void> => {
    const flags: FEATURE_FLAG_ID[] = value
      ? [...enabledFeatures, feature.id]
      : enabledFeatures.filter((e) => e !== feature.id);
    if (value) {
      WalletAlert({
        title: translate(
          "screens/FeatureFlagScreen",
          "Enable {{feature}} (Beta)",
          { feature: translate("screens/Settings", feature.name) }
        ),
        message: translate(
          "screens/FeatureFlagScreen",
          "This feature is still in Beta, upon activation you will be expose to some risks. Do you want to continue?"
        ),
        buttons: [
          {
            text: translate("screens/FeatureFlagScreen", "Cancel"),
            style: "cancel",
          },
          {
            text: translate("screens/FeatureFlagScreen", "Continue"),
            style: "destructive",
            onPress: async () => {
              setBetaFeatures(getBetaFeature(flags));
              await updateEnabledFeatures(flags);
            },
          },
        ],
      });
    } else {
      setBetaFeatures(getBetaFeature(flags));
      await updateEnabledFeatures(flags);
    }
  };

  return (
    <ThemedScrollViewV2 testID="features_flag_screen">
      <View style={tailwind("flex-1 px-10 py-8")}>
        <ThemedTextV2 style={tailwind("text-base font-normal-v2")}>
          {translate(
            "screens/FeatureFlagScreen",
            "Light Wallet beta features are in the user acceptance testing phase. Using beta feature(s) is encouraged, but caution is advised when using your assets."
          )}
        </ThemedTextV2>
      </View>
      {betaFeatures.map((item: BetaFeaturesI) => (
        <FeatureFlagItem key={item.id} item={item} onChange={onFeatureChange} />
      ))}
    </ThemedScrollViewV2>
  );
}

interface FeatureFlagItemProps {
  item: BetaFeaturesI;
  onChange: (feature: FeatureFlag, value: boolean) => void;
}

export function FeatureFlagItem({
  item,
  onChange,
}: FeatureFlagItemProps): JSX.Element {
  return (
    <View testID={`feature_${item.id}_row`}>
      <ThemedView
        dark={tailwind("bg-black")}
        light={tailwind("bg-white")}
        style={tailwind(
          "flex flex-row p-4 mx-5 items-center justify-between rounded-lg"
        )}
      >
        <ThemedText
          dark={tailwind("text-mono-dark-v2-900")}
          light={tailwind("text-mono-light-v2-900")}
          style={tailwind("text-sm font-normal-v2")}
        >
          {translate("screens/FeatureFlagScreen", item.name)}
        </ThemedText>

        <View style={tailwind("flex-row items-center")}>
          <Switch
            onValueChange={(v: boolean) => {
              onChange(item, v);
            }}
            testID={`feature_${item.id}_switch`}
            value={item.value}
          />
        </View>
      </ThemedView>
      <ThemedText
        dark={tailwind("text-mono-dark-v2-500")}
        light={tailwind("text-mono-light-v2-500")}
        style={tailwind("px-10 py-2 mb-2 text-xs font-normal-v2")}
      >
        {translate("screens/FeatureFlagScreen", item.description)}
      </ThemedText>
    </View>
  );
}
