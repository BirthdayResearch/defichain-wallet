import { SecuredStoreAPI } from "@api";
import { CustomServiceProviderType } from "@contexts/CustomServiceProvider";

const KEY = "WALLET.SERVICE_PROVIDER_URL";

async function set(
  url: NonNullable<string>,
  type: CustomServiceProviderType = CustomServiceProviderType.DVM,
): Promise<void> {
  const STORAGE_KEY =
    type === CustomServiceProviderType.DVM ? KEY : `${KEY}.${type}`;
  await SecuredStoreAPI.setItem(STORAGE_KEY, url);
}

async function get(
  type: CustomServiceProviderType = CustomServiceProviderType.DVM,
): Promise<string | undefined> {
  const STORAGE_KEY =
    type === CustomServiceProviderType.DVM ? KEY : `${KEY}.${type}`;
  const val = await SecuredStoreAPI.getItem(STORAGE_KEY);
  return val != null ? val : undefined;
}

/**
 * Service Provider persistence layer
 */
export const ServiceProviderPersistence = {
  get,
  set,
};
