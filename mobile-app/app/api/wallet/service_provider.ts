import { SecuredStoreAPI } from "@api";
import { CustomServiceProviderType } from "@contexts/CustomServiceProvider";

const KEY = "WALLET.SERVICE_PROVIDER_URL";

async function set(
  url: NonNullable<string>,
  type: CustomServiceProviderType = "dvm",
): Promise<void> {
  await SecuredStoreAPI.setItem(`${KEY}.${type}`, url);
}

async function get(
  type: CustomServiceProviderType = "dvm",
): Promise<string | undefined> {
  const val = await SecuredStoreAPI.getItem(`${KEY}.${type}`);
  return val != null ? val : undefined;
}

/**
 * Service Provider persistence layer
 */
export const ServiceProviderPersistence = {
  get,
  set,
};
