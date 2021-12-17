import React from 'react'
import { ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { useGetAnnouncementsQuery } from '@store/website'
import { AnnouncementData } from '@shared-types/website'
import { satisfies } from 'semver'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { openURL } from '@api/linking'
import { Platform, TouchableOpacity } from 'react-native'
import { nativeApplicationVersion } from 'expo-application'
import { translate } from '@translations'
import { Text } from '@components'
import { MaterialIcons } from '@expo/vector-icons'

export function Announcements (): JSX.Element {
  const {
    data: announcements,
    isSuccess
  } = useGetAnnouncementsQuery({})
  const {
    language
  } = useLanguageContext()

  const announcement = findAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', language, announcements)

  if (!isSuccess || announcements === undefined || announcements.length === 0 || announcement === undefined) {
    return <></>
  }

  return (
    <ThemedView
      testID='announcements_banner'
      style={tailwind('px-4 py-3 flex-row items-center')}
      light={tailwind('bg-primary-700')}
      dark={tailwind('bg-darkprimary-700')}
    >
      <MaterialIcons
        style={tailwind('mr-2.5 text-white')}
        iconType='MaterialIcons'
        name='campaign'
        size={22}
      />
      <Text
        style={tailwind('text-xs flex-auto text-white')}
        testID='announcements_text'
      >
        {`${announcement.content} `}
      </Text>
      {announcement.url !== undefined && announcement.url.length !== 0 &&
        (
          <TouchableOpacity
            onPress={async () => await openURL(announcement.url)}
            style={tailwind('py-1 px-2 rounded border border-white')}
          >
            <Text style={tailwind('text-xs font-medium text-white')}>
              {translate('components/Announcements', 'VIEW')}
            </Text>
          </TouchableOpacity>
        )}
    </ThemedView>
  )
}

interface Announcement {
  content: string
  url: string
}

function findAnnouncementForVersion (version: string, language: string, announcements?: AnnouncementData[]): Announcement | undefined {
  if (announcements === undefined || announcements.length === 0) {
    return undefined
  }

  for (const announcement of announcements) {
    const lang: any = announcement.lang
    const platformUrl: any = announcement.url

    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return {
        content: lang[language] ?? lang.en,
        url: platformUrl[Platform.OS]
      }
    }

    if (satisfies(version, announcement.version)) {
      return {
        content: lang[language] ?? lang.en,
        url: platformUrl[Platform.OS]
      }
    }
  }
}
