import { EnvironmentNetwork, getEnvironment } from '../../environment'
import { StorageProvider } from './provider'

/**
 * @return EnvironmentNetwork if invalid, will be set to `networks[0]`
 */
async function getNetwork (): Promise<EnvironmentNetwork> {
  const env = getEnvironment()
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
  const env = getEnvironment()

  if (!env.networks.includes(network)) {
    throw new Error('network is not part of environment')
  }

  await StorageProvider.setItem(`${env.name}.NETWORK`, network)
}

async function getKey (key: string): Promise<string> {
  const env = getEnvironment()
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

export const StorageAPI = {
  getNetwork,
  setNetwork,
  getItem,
  setItem,
  removeItem
}
