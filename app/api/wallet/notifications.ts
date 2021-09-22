import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { PermissionStatus } from 'expo-modules-core'

interface SendNotificationProps {
  title: string
  body: string
  data?: { [key: string]: unknown }
}

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

      if (finalStatus !== PermissionStatus.GRANTED) {
        return
      }
      this.status = finalStatus
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
   * Register notifications permission for app.
   * @param {string} title
   * @param {string} body
   * @param {{ key: string]: unknown }} data
   */
  async send ({ title, body, data = {} }: SendNotificationProps): Promise<void> {
    if (this.status === PermissionStatus.GRANTED) {
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
