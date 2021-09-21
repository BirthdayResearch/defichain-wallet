import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { PermissionStatus } from 'expo-modules-core'

/**
 * Wallet push notification implementation light wallet
 */
class NotificationsService {
  status: PermissionStatus | undefined

   /**
   * Register notifications permission for app.
   */
  async register (): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
      })
    })

    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus
      if (existingStatus !== PermissionStatus.GRANTED) {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true
          }
        })
        finalStatus = status
      }

      if (finalStatus !== PermissionStatus.GRANTED) {
        return
      }
      this.status = finalStatus
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250]
        })
      }
    }
  }

  /**
   * Register notifications permission for app.
   * @param {string} title
   * @param {string} body
   * @param {{ key: string]: unknown }} data
   */
  async send ({ title, body, data = {} }: {title: string, body: string, data?: { [key: string]: unknown } }): Promise<void> {
    if (this.status === PermissionStatus.GRANTED) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default'
        },
        trigger: null
      })
    }
  }
}

export const WalletNotifications = new NotificationsService()
