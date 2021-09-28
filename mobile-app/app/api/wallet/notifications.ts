import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { PermissionStatus } from 'expo-modules-core'
import { NotificationType } from '@api/persistence/notification_storage'

export interface SendNotificationData {
  title: string
  body: string
  type: NotificationType
  data?: { [key: string]: string | object }
}

/**
 * Wallet push notification implementation light wallet
 */
class NotificationsService {
  status?: PermissionStatus
  enabledNotificationTypes: NotificationType[] = []

   /**
   * Register notifications permission for app.
   */
  async register (): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
      })
    })

    if (Platform.OS !== 'web') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus
      if (existingStatus !== PermissionStatus.GRANTED) {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowAnnouncements: true
          }
        })
        finalStatus = status
      }

      this.status = finalStatus
      if (finalStatus !== PermissionStatus.GRANTED) {
        return
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          sound: null
        })
      }
    }
  }

  /**
   * Set enabled notifications type in the app.
   * @param {NotificationType []} notificationTypes
   */
  setEnabledNotificationTypes (notificationTypes: NotificationType[]): void {
    this.enabledNotificationTypes = notificationTypes ?? []
  }

  /**
   * Send notifications for app.
   * @param {string} title
   * @param {string} body
   * @param {{ key: string]: unknown }} data
   */
  async send ({ type, title, body, data = {} }: SendNotificationData): Promise<void> {
    if (this.status === PermissionStatus.GRANTED && this.enabledNotificationTypes.includes(type)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data
        },
        trigger: null
      })
    }
  }
}

export const WalletNotifications = new NotificationsService()
