import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.ENABLED_NOTIFICATION'

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
}

export interface AppNotificationTypesI {
  type: NotificationType
  value: boolean
  displayName: string
}

async function set (enabledNotifications: NotificationType[] = []): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(enabledNotifications))
}

async function get (): Promise<NotificationType[]> {
  const notificationTypes = await AsyncStorage.getItem(KEY) ?? '[]'
  return JSON.parse(notificationTypes)
}

export const NotificationPersistence = {
  set,
  get
}
