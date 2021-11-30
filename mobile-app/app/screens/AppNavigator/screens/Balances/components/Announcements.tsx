import React from 'react'
import { ThemedIcon, ThemedText, ThemedTouchableOpacity, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { useGetAnnouncementsQuery } from '@store/website'
import { AnnouncementData } from '@shared-types/website'
import { nativeApplicationVersion } from 'expo-application'
import { satisfies } from 'semver'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'
import { openURL } from '@api/linking'
import { View } from '@components'
import { Platform } from 'react-native'

export function Announcements (): JSX.Element {
  const {
    data: announcements,
    isSuccess
  } = useGetAnnouncementsQuery({})
  const {
    language
  } = useLanguageContext()

  if (!isSuccess || announcements === undefined || announcements.length === 0) {
    return <></>
  }

  const announcement = findAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', announcements, language)

  if (announcement === undefined) {
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
              name='open-in-new'
              size={14}
              style={tailwind('relative top-0.5')}
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

function findAnnouncementForVersion (version: string, announcements: AnnouncementData[], language: string): Announcement | undefined {
  for (const announcement of announcements) {
    if (satisfies(version, announcement.version)) {
      const lang: any = announcement.lang
      const platformUrl: any = announcement.url
      return {
        content: lang[language] ?? lang.en,
        url: platformUrl[Platform.OS]
      }
    }
  }

  return undefined
}
