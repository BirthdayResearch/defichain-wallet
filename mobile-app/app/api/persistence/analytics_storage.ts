import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_PREFIX_KEY = "WALLET.";

export async function getStorageItem<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") {
    return null;
  }
  const prefixedKey = `${STORAGE_PREFIX_KEY}${key}`;
  const value = await AsyncStorage.getItem(prefixedKey);
  const currentValue = JSON.parse(value || String(null));
  return currentValue === null ? undefined : currentValue;
}

export async function setStorageItem<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  const prefixedKey = `${STORAGE_PREFIX_KEY}${key}`;
  await AsyncStorage.setItem(prefixedKey, JSON.stringify(value));
}
