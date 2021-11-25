import React from 'react'
import { ThemedIcon, ThemedText, ThemedView } from '@components/themed'
import { tailwind } from '@tailwind'
import { useGetAnnouncementsQuery } from '@store/website'
import { AnnouncementData } from '@shared-types/website'
import { nativeApplicationVersion } from 'expo-application'
import { satisfies } from 'semver'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'

export function Announcements (): JSX.Element {
  const {
    data: announcements,
    isSuccess
  } = useGetAnnouncementsQuery({})
  const {
    language
  } = useLanguageContext()
  if (isSuccess && announcements !== undefined && announcements?.length > 0) {
    const announcement = findAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', announcements, language)
    if (announcement !== undefined) {
      return (
        <ThemedView
          testID='announcements_banner'
          style={tailwind('px-4 py-3 flex-row items-center')} light={tailwind('bg-warning-50')}
          dark={tailwind('bg-dfxblue-900')}
        >
          <ThemedIcon style={tailwind('mr-2')} dark={tailwind('text-dfxblue-500')} iconType='MaterialIcons' name='campaign' size={22} />
          <ThemedText style={tailwind('text-xs flex-auto')} dark={tailwind('text-dfxblue-500')} testID='announcements_text'>
            {announcement}
          </ThemedText>
        </ThemedView>
      )
    }
  }
  return <></>
}

function findAnnouncementForVersion (version: string, announcements: AnnouncementData[], language: string): string | undefined {
  for (const announcement of announcements) {
    if (satisfies(version, announcement.version)) {
      const lang: any = announcement.lang
      return lang[language] ?? lang.en
    }
  }

  return undefined
}
