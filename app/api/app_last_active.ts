import { EnvironmentName, getEnvironment } from '../environment'
import { StorageAPI } from './storage'

const KEY = 'APP_LAST_ACTIVE.timestamp'

async function set (): Promise<void> {
  return await StorageAPI.setItem(KEY, `${Date.now()}`)
}

async function forceRequireReauthenticate (): Promise<void> {
  return await StorageAPI.setItem(KEY, `${Date.now() - getTimeoutPeriod()}`)
}

async function shouldReauthenticate (): Promise<boolean> {
  const lastActive = await StorageAPI.getItem(KEY)
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
  shouldReauthenticate
}
