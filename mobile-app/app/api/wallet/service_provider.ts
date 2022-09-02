import { SecuredStoreAPI } from "@api";

const KEY = "WALLET.SERVICE_PROVIDER_URL";

async function set(url: NonNullable<string>): Promise<void> {
  await SecuredStoreAPI.setItem(KEY, url);
}

async function get(): Promise<string | undefined> {
  const val = await SecuredStoreAPI.getItem(KEY);
  return val != null ? val : undefined;
}

/**
 * Service Provider persistence layer
 */
export const ServiceProviderPersistence = {
  get,
  set,
};
