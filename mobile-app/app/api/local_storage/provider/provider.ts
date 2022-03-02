import { ILocalStorage } from './index'
import { UserPreferences } from '@store/userPreferences'
import { EnvironmentNetwork } from '@environment'

const LOCAL_STORAGE_KEY = 'WALLET.SETTINGS'

function getKey (network: EnvironmentNetwork): string {
  return `${network}${LOCAL_STORAGE_KEY}`
}

async function getUserPreferences (network: EnvironmentNetwork): Promise<UserPreferences> {
  const value = localStorage.getItem(getKey(network)) ?? ''
  return JSON.parse(value)
}

async function setUserPreferences (network: EnvironmentNetwork, userPreferences: UserPreferences): Promise<void> {
  localStorage.setItem(getKey(network), JSON.stringify(userPreferences))
}

export const Provider: ILocalStorage = {
  getUserPreferences,
  setUserPreferences
}
