import { EnvironmentName, getEnvironment } from '../environment'
import { StorageAPI } from './storage'

const KEYS = {
  force: 'APP_LAST_ACTIVE.force',
  timestamp: 'APP_LAST_ACTIVE.timestamp'
}

async function set (): Promise<void> {
  return await StorageAPI.setItem(KEYS.timestamp, `${Date.now()}`)
}

async function removeForceAuth (): Promise<void> {
  return await StorageAPI.removeItem(KEYS.force)
}

async function forceRequireReauthenticate (): Promise<void> {
  return await StorageAPI.setItem(KEYS.force, 'TRUE')
}

async function shouldReauthenticate (): Promise<boolean> {
  const forced = await StorageAPI.getItem(KEYS.force) === 'TRUE'
  if (forced) return true

  const lastActive = await StorageAPI.getItem(KEYS.timestamp)
  if (lastActive === null) return false
  return Number(lastActive) + getTimeoutPeriod() < Date.now()
}

function getTimeoutPeriod (): number {
  const env = getEnvironment()
  if (env.name === EnvironmentName.Development) {
    return 3000
  }
  return 60000
}

/**
 * Failed passcode input counter persistence layer
 */
export const AppLastActiveTimestamp = {
  set,
  forceRequireReauthenticate,
  removeForceAuth,
  shouldReauthenticate
}
