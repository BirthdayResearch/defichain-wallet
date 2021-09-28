import { ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { ThemedSectionTitle } from '@components/themed/ThemedSectionTitle'
import { Switch } from '@components/index'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Logging, NotificationPersistence } from '@api'
import { AppNotificationTypesI, NotificationType } from '@api/persistence/notification_storage'
import { WalletNotifications } from '@api/wallet/notifications'

const AppNotificationTypes: Array<{
  type: NotificationType
  displayName: string
}> = [
  {
    type: NotificationType.TRANSACTION,
    displayName: 'Transactions'
  }
]

function notificationParser (preferences: NotificationType[]): AppNotificationTypesI[] {
  return AppNotificationTypes.map(({ type, displayName }) => {
    const value = preferences.includes(type)
    return { type, displayName, value }
  }, {})
}

export function NotificationScreen (): JSX.Element {
  const [notificationsTypes, setNotificationsTypes] = useState<AppNotificationTypesI[]>([])
  const [enabledNotifications, setEnabledNotifications] = useState<NotificationType[]>([])

  useEffect(() => {
    NotificationPersistence.get()
      .then((notifications) => {
        setEnabledNotifications(notifications)
        setNotificationsTypes(notificationParser(notifications))
      })
      .catch((err) => Logging.error(err))
  }, [])

  const onPreferenceChange = async (type: NotificationType, value: boolean): Promise<void> => {
    const updatedPreference: AppNotificationTypesI[] = notificationsTypes.map((eachType) => {
      return type === eachType.type ? { ...eachType, value } : eachType
    })
    setNotificationsTypes(updatedPreference)
    const updatedNotifications: NotificationType[] = value ? [...enabledNotifications, type] : enabledNotifications.filter(e => e !== type)
    await NotificationPersistence.set(updatedNotifications)
    // check wallet notification is register or not, if not then register
    if (WalletNotifications.status === undefined) {
      await WalletNotifications.register()
    }
    WalletNotifications.setEnabledNotificationTypes(updatedNotifications)
  }

  return (
    <ThemedScrollView light={tailwind('bg-white')}>
      <View testID='notification_screen'>
        <ThemedSectionTitle
          testID='notification_screen_title'
          text={translate('screens/NotificationScreen', 'APP NOTIFICATIONS')}
        />

        {notificationsTypes.map((eachType: AppNotificationTypesI) => (
          <RowNotificationItem key={eachType.type} item={eachType} onChange={onPreferenceChange} />
        ))}

        <View style={tailwind('p-4')}>
          <ThemedText
            dark={tailwind('text-gray-600')}
            light={tailwind('text-gray-400')}
            style={tailwind('text-xs font-normal')}
          >
            {translate('screens/NotificationScreen', 'Show a notification for your in-app transactions.')}
          </ThemedText>
        </View>
      </View>
    </ThemedScrollView>
  )
}

export const RowNotificationItem = (
  { item, onChange }: {item: AppNotificationTypesI, onChange: (type: NotificationType, value: boolean) => void}): JSX.Element => {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('flex flex-row p-4 pr-2 items-center justify-between')}
      testID='notification_type_row'
    >
      <ThemedText
        dark={tailwind('text-white text-opacity-90')}
        light={tailwind('text-black')}
        style={tailwind('font-medium')}
      >
        {translate('screens/NotificationScreen', item.displayName)}
      </ThemedText>

      <View style={tailwind('flex-row items-center')}>
        <Switch
          onValueChange={async (v) => {
            onChange(item.type, v)
          }}
          testID={`notification_${item.type}_switch`}
          value={item.value}
        />

      </View>
    </ThemedView>
  )
}
