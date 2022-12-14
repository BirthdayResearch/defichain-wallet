import AsyncStorage from "@react-native-async-storage/async-storage";
import { FeatureFlagID } from "@waveshq/walletkit-core";

const KEY = "WALLET.ENABLED_FEATURES";

async function set(features: FeatureFlagID[] = []): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(features));
}

async function get(): Promise<FeatureFlagID[]> {
  const features = (await AsyncStorage.getItem(KEY)) ?? "[]";
  return JSON.parse(features);
}

export const FeatureFlagPersistence = {
  set,
  get,
};
