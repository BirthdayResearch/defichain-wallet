import { ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { ThemedSectionTitle } from '@components/themed/ThemedSectionTitle'
import { Switch } from '@components/index'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Logging, NotificationPersistence } from '@api'
import { AppNotificationTypesI, NotificationType } from '@api/persistence/notifiction_storage'
import { WalletNotifications } from '@api/wallet/notifications'

export function NotificationScreen (): JSX.Element {
  const [notificationsTypes, setNotificationsTypes] = useState<AppNotificationTypesI[]>([])

  useEffect(() => {
    NotificationPersistence.get()
      .then((notificationsT) => {
        setNotificationsTypes(notificationsT)
      })
      .catch((err) => Logging.error(err))
  }, [])

  const onPreferanceChange = async (type: NotificationType, value: boolean): Promise<void> => {
    const updatedPreferance: AppNotificationTypesI[] = notificationsTypes.map((eachType) => {
      return type === eachType.type ? { ...eachType, value } : eachType
    })
    setNotificationsTypes(updatedPreferance)
    await NotificationPersistence.set(updatedPreferance)
    WalletNotifications.setAllowedNotificationTypes(updatedPreferance)
  }

  return (
    <ThemedScrollView light={tailwind('bg-white')}>
      <View testID='notification_screen'>
        <ThemedSectionTitle
          testID='notification_screen_title'
          text={translate('screens/NotificationScreen', 'APP NOTIFICATIONS')}
        />

        {notificationsTypes.map((eachType: AppNotificationTypesI) => (
          <RowNotificationItem key={eachType.type} item={eachType} onChange={onPreferanceChange} />
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
