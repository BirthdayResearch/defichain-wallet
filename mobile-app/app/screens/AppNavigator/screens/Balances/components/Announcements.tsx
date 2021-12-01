import React from 'react'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { useGetAnnouncementsQuery } from '@store/website'
import { AnnouncementData } from '@shared-types/website'
import { satisfies } from 'semver'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { openURL } from '@api/linking'
import { View } from '@components'
import { Platform } from 'react-native'
import packageJson from '@package'

export function Announcements (): JSX.Element {
  const {
    data: announcements,
    isSuccess
  } = useGetAnnouncementsQuery({})
  const {
    language
  } = useLanguageContext()

  const announcement = findAnnouncementForVersion(packageJson.version ?? '0.0.0', language, announcements)

  if (!isSuccess || announcements === undefined || announcements.length === 0 || announcement === undefined) {
    return <></>
  }

  if (announcement.url !== undefined && announcement.url.length !== 0) {
    return (
      <ThemedTouchableOpacity
        testID='announcements_banner'
        style={tailwind('px-4 py-3 flex-row items-center')} light={tailwind('bg-warning-50')}
        dark={tailwind('bg-darkwarning-50')}
        onPress={async () => await openURL(announcement.url)}
      >
        <ThemedIcon style={tailwind('mr-2')} iconType='MaterialIcons' name='campaign' size={22} />
        <ThemedText style={tailwind('text-xs flex-auto')} testID='announcements_text'>
          {`${announcement.content} `}
          <View>
            <ThemedIcon
              dark={tailwind('text-darkprimary-500')}
              iconType='MaterialIcons'
              light={tailwind('text-primary-500')}
              name='chevron-right'
              size={18}
              style={tailwind('relative -left-1 top-1')}
            />
          </View>
        </ThemedText>
      </ThemedTouchableOpacity>
    )
  }

  return (
    <ThemedView
      testID='announcements_banner'
      style={tailwind('px-4 py-3 flex-row items-center')} light={tailwind('bg-warning-50')}
      dark={tailwind('bg-darkwarning-50')}
    >
      <ThemedIcon style={tailwind('mr-2')} iconType='MaterialIcons' name='campaign' size={22} />
      <ThemedText style={tailwind('text-xs flex-auto')} testID='announcements_text'>
        {announcement.content}
      </ThemedText>
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
    if (satisfies(version, announcement.version)) {
      return {
        content: lang[language] ?? lang.en,
        url: platformUrl[Platform.OS]
      }
    }
  }
}
