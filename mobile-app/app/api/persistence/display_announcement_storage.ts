import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.HIDDEN_ANNOUNCEMENTS'

async function set (hiddenAnnouncement: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(hiddenAnnouncement))
}

async function get (): Promise<string[]> {
  const hiddenAnnouncement = await AsyncStorage.getItem(KEY) ?? '[]'
  return JSON.parse(hiddenAnnouncement)
}

export const DisplayAnnouncementPersistence = {
  set,
  get
}
