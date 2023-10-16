import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "WALLET.EVMDOMAIN";

async function set(domain: NonNullable<string>): Promise<void> {
  await AsyncStorage.setItem(KEY, domain);
}

async function get(): Promise<string | null> {
  return await AsyncStorage.getItem(KEY);
}

export const DomainPersistence = {
  set,
  get,
};
