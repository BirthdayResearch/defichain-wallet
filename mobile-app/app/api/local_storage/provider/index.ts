import { Provider } from './provider'
import { UserPreferences } from '@store/userPreferences'
import { EnvironmentNetwork } from '@environment'

/**
 * Provider local storage interface for platform agnostic local storage provider
 */
export interface ILocalStorage {
  getUserPreferences: (network: EnvironmentNetwork) => Promise<UserPreferences>
  setUserPreferences: (network: EnvironmentNetwork, userPreferences: UserPreferences) => Promise<void>
}

/**
 * Platform agnostic local storage provider
 * Stores it on a specific file for mobile or local storage on web
 */
export const LocalStorageProvider = Provider
