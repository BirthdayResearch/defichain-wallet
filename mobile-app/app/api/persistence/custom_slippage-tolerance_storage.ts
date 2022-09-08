import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "WALLET.CUSTOM_SLIPPAGE_TOLERANCE";

async function set(
  customSlippageTolerance: NonNullable<string>
): Promise<void> {
  await AsyncStorage.setItem(KEY, customSlippageTolerance);
}
async function get(): Promise<string> {
  const isCustom = (await AsyncStorage.getItem(KEY)) ?? "false";
  return JSON.parse(isCustom);
}

export const CustomSlippageTolerancePersistence = {
  set,
  get,
};
