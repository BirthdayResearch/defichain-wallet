import { ILocalStorage } from './index'
import * as FileSystem from 'expo-file-system'
import { UserPreferences } from '@store/userPreferences'
import { EnvironmentNetwork } from '@environment'
import { Logging } from '@api'

const LOCAL_STORAGE_FILENAME = 'wallet_settings'
const LOCAL_STORAGE_FILE_TYPE = '.json'

function getFileName (network: EnvironmentNetwork, directory: string): string {
  return `${directory}${LOCAL_STORAGE_FILENAME}_${network}${LOCAL_STORAGE_FILE_TYPE}`
}

async function ensureFileExist (directory: string): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(directory)
  if (!fileInfo.exists) {
    try {
      await FileSystem.writeAsStringAsync(directory, JSON.stringify({}), { encoding: 'utf8' })
    } catch (e: any) {
      Logging.error(e)
      throw new Error(e)
    }
  }
}

async function getUserPreferences (network: EnvironmentNetwork): Promise<UserPreferences> {
  let userPreferences = null
  if (FileSystem.documentDirectory != null) {
    const directory = getFileName(network, FileSystem.documentDirectory)
    try {
      await ensureFileExist(directory)
      const fileContents = await FileSystem.readAsStringAsync(directory)
      userPreferences = fileContents !== undefined ? JSON.parse(fileContents) : userPreferences
    } catch (e) {
      Logging.error(e)
    }
  }
  return userPreferences ?? {}
}

async function setUserPreferences (network: EnvironmentNetwork, userPreferences: UserPreferences): Promise<void> {
  try {
    if (FileSystem.documentDirectory !== null) {
      try {
        const directory = getFileName(network, FileSystem.documentDirectory)
        await ensureFileExist(directory)
        await FileSystem.writeAsStringAsync(directory, JSON.stringify(userPreferences), { encoding: 'utf8' })
      } catch (e) {
        Logging.error(e)
      }
    }
  } catch (e) {
    Logging.error(e)
  }
}

export const Provider: ILocalStorage = {
  getUserPreferences,
  setUserPreferences
}
