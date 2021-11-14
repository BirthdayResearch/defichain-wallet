import { EnvironmentNetwork, getEnvironment } from '@environment'
import { StorageProvider } from './provider'
import { getReleaseChannel } from '@api/releaseChannel'

/**
 * @return EnvironmentNetwork if invalid, will be set to `networks[0]`
 */
async function getNetwork (): Promise<EnvironmentNetwork> {
  const env = getEnvironment(getReleaseChannel())
  const network = await StorageProvider.getItem(`${env.name}.NETWORK`)

  if ((env.networks as any[]).includes(network)) {
    return network as EnvironmentNetwork
  }

  await setNetwork(env.networks[0])
  return env.networks[0]
}

/**
 * @param network {EnvironmentNetwork} with set with 'environment' prefixed
 */
async function setNetwork (network: EnvironmentNetwork): Promise<void> {
  const env = getEnvironment(getReleaseChannel())

  if (!env.networks.includes(network)) {
    throw new Error('network is not part of environment')
  }

  await StorageProvider.setItem(`${env.name}.NETWORK`, network)
}

async function getKey (key: string): Promise<string> {
  const env = getEnvironment(getReleaseChannel())
  const network = await getNetwork()
  return `${env.name}.${network}.${key}`
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 * @return {string | null}
 */
async function getItem (key: string): Promise<string | null> {
  return await StorageProvider.getItem(await getKey(key))
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 * @param value {string} to set
 * @throws Error when byte length exceed 2048 bytes
 */
async function setItem (key: string, value: string): Promise<void> {
  if (Buffer.byteLength(value, 'utf-8') >= 2048) {
    throw new Error('value exceed 2048 bytes, unable to setItem')
  }
  return await StorageProvider.setItem(await getKey(key), value)
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 */
async function removeItem (key: string): Promise<void> {
  await StorageProvider.removeItem(await getKey(key))
}

/**
 * Secured Store provides a way to encrypt and securely store key–value pairs locally on the native device.
 * On web for non production workload, it uses AsyncStorage.
 *
 * SecuredStoreAPI is also used to keep track of current set network. All key/value stored in SecuredStore
 * is network prefix. By design isolated each key/value to their network specific store allowing separation
 * of sensitive value between networks. Thus SecuredStoreAPI should only be used for sensitive values e.g. wallet.
 */
export const SecuredStoreAPI = {
  getNetwork,
  setNetwork,
  getItem,
  setItem,
  removeItem
}
