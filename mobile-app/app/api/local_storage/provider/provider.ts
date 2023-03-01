import { UserPreferences } from "@store/userPreferences";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ILocalStorage } from "./index";

const LOCAL_STORAGE_KEY = "WALLET.SETTINGS";

function getKey(network: EnvironmentNetwork): string {
  return `${network}.${LOCAL_STORAGE_KEY}`;
}

async function getUserPreferences(
  network: EnvironmentNetwork
): Promise<UserPreferences> {
  const value = (await AsyncStorage.getItem(getKey(network))) ?? "";
  return JSON.parse(value);
}

async function setUserPreferences(
  network: EnvironmentNetwork,
  userPreferences: UserPreferences
): Promise<void> {
  await AsyncStorage.setItem(getKey(network), JSON.stringify(userPreferences));
}

export const Provider: ILocalStorage = {
  getUserPreferences,
  setUserPreferences,
};
