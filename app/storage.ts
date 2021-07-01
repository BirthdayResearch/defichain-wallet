import AsyncStorage from '@react-native-async-storage/async-storage'
import { EnvironmentNetwork, getEnvironment } from './environment'

/**
 * @return EnvironmentNetwork if invalid, will be set to `networks[0]`
 */
export async function getNetwork (): Promise<EnvironmentNetwork> {
  const env = getEnvironment()
  const network = await AsyncStorage.getItem(`${env.name}.NETWORK`)

  if ((env.networks as any[]).includes(network)) {
    return network as EnvironmentNetwork
  }

  await setNetwork(env.networks[0])
  return env.networks[0]
}

/**
 * @param network {EnvironmentNetwork} with set with 'environment' prefixed
 */
export async function setNetwork (network: EnvironmentNetwork): Promise<void> {
  const env = getEnvironment()

  if (!env.networks.includes(network)) {
    throw new Error('network is not part of environment')
  }

  await AsyncStorage.setItem(`${env.name}.NETWORK`, network)
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
export async function getItem (key: string): Promise<string | null> {
  return await AsyncStorage.getItem(await getKey(key))
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 * @param value {string} to set
 */
export async function setItem (key: string, value: string): Promise<void> {
  return await AsyncStorage.setItem(await getKey(key), value)
}

/**
 * @param key {string} of item with 'environment' and 'network' prefixed
 */
export async function removeItem (key: string): Promise<void> {
  await AsyncStorage.removeItem(await getKey(key))
}
