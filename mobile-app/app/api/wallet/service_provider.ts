import { SecuredStoreAPI } from "@api";
import { CustomServiceProviderType } from "@contexts/CustomServiceProvider";

const KEY = "WALLET.SERVICE_PROVIDER_URL";

async function set(
  url: NonNullable<string>,
  type: CustomServiceProviderType = CustomServiceProviderType.DVM,
): Promise<void> {
  await SecuredStoreAPI.setItem(`${KEY}.${type}`, url);
}

async function get(
  type: CustomServiceProviderType = CustomServiceProviderType.DVM,
): Promise<string | undefined> {
  const PROVIDER_KEY = `${KEY}.${type}`;
  const val = await SecuredStoreAPI.getItem(PROVIDER_KEY);

  if (type === CustomServiceProviderType.DVM && val === null) {
    const existingDvm = await SecuredStoreAPI.getItem(KEY);
    if (existingDvm !== null) {
      await SecuredStoreAPI.setItem(PROVIDER_KEY, existingDvm);
      await SecuredStoreAPI.removeItem(KEY);
      return existingDvm;
    }
  }

  return val !== null ? val : undefined;
}

/**
 * Service Provider persistence layer
 */
export const ServiceProviderPersistence = {
  get,
  set,
};
