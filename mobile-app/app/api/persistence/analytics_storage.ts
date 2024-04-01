import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "WALLET.ANALYTICS";

async function set(theme: NonNullable<string>): Promise<void> {
  await AsyncStorage.setItem(KEY, theme);
}

async function get(): Promise<string | null> {
  return await AsyncStorage.getItem(KEY);
}

export const AnalyticsPersistence = {
  set,
  get,
};
