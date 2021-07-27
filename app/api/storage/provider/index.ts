import { Provider } from './provider'

/**
 * Provider storage interface for platform agnostic storage provider
 */
export interface IStorage {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

/**
 * Platform agnostic storage provider
 */
export const StorageProvider = Provider
