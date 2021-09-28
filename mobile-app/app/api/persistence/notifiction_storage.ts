import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'WALLET.NOTIFICATION'

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
}

export interface AppNotificationTypesI {
  type: NotificationType
  value: boolean
  displayName: string
}

function getAppNotificationTypes (): Array<{
  type: NotificationType
  displayName: string
  dafaultValue: boolean
}> {
  return [
    {
      type: NotificationType.TRANSACTION,
      displayName: 'Transactions',
      dafaultValue: true
    }
  ]
}

function notificationParser (preferances: AppNotificationTypesI[]): AppNotificationTypesI[] {
  const notificationsTypes = getAppNotificationTypes()
  return notificationsTypes.map(({ type, displayName, dafaultValue }) => {
    const savedType = preferances.find((each) => {
      return each.type === type
    })
    const value = (typeof savedType?.value === 'boolean') ? savedType?.value : dafaultValue
    return { type, displayName, value }
  }, {})
}

async function set (preferance: AppNotificationTypesI[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(preferance))
}

async function get (): Promise<AppNotificationTypesI[]> {
  const notificationTypes = await AsyncStorage.getItem(KEY) ?? '[]'
  return notificationParser(JSON.parse(notificationTypes))
}

export const NotificationPersistence = {
  set,
  get
}
