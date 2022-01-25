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
import { useDisplayAnnouncement } from '../hooks/DisplayAnnouncement'
import { useEffect, useState } from 'react'
import { useBlockchainStatus } from '@hooks/useBlockchainStatus'

export function Announcements (): JSX.Element {
  const {
    data: announcements,
    isSuccess
  } = useGetAnnouncementsQuery({})
  const {
    language
  } = useLanguageContext()
  const {
    hiddenAnnouncements,
    hideAnnouncement
  } = useDisplayAnnouncement()
  const isBlockchainDown = useBlockchainStatus()
  const deFiChainStatusUrl = 'https://status.defichain.com/'

  const blockChainIsDownContent: AnnouncementData[] = [{
    lang: {
      en: 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.',
      de: 'Wir untersuchen derzeit ein Synchronisierungsproblem der Blockchain. Weitere Details auf der DeFiChain Statusseite.',
      'zh-Hans': '我们目前正在调查区块链上的同步化问题。前往 DeFiChain Status 页面 了解更多状态详情。',
      'zh-Hant': '我們目前正在調查區塊鏈上的同步化問題。前往 DeFiChain Status 頁面 了解更多狀態詳情。',
      fr: '' // get translation from team
    },
    version: '0.0.0',
    url: {
      ios: deFiChainStatusUrl,
      android: deFiChainStatusUrl,
      windows: deFiChainStatusUrl,
      web: deFiChainStatusUrl,
      macos: deFiChainStatusUrl
    }
  }]

  const [emergencyMsgContent, setemergencyMsgContent] = useState<AnnouncementData[] | undefined>()
  const announcement = findAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', language, announcements)
  const emergencyAnnouncement = findAnnouncementForVersion('0.0.0', language, emergencyMsgContent)
  const existingAnnouncements = getDisplayAnnouncement(hiddenAnnouncements, announcement)
  const displayAnnouncement = emergencyAnnouncement !== null || existingAnnouncements
  const announcementToDisplay = emergencyAnnouncement ?? announcement

  useEffect(() => {
    if (isBlockchainDown) {
      setemergencyMsgContent(blockChainIsDownContent)
    } else {
      setemergencyMsgContent(undefined)
    }
  }, [isBlockchainDown])

  if (!isSuccess || (announcementToDisplay == null) || !displayAnnouncement) {
    return <></>
  }

  return (
    <AnnouncementBanner announcement={announcementToDisplay} hideAnnouncement={hideAnnouncement} />
  )
}

interface AnnouncementBannerProps {
  hideAnnouncement: (id: string) => void
  announcement: Announcement
}

function AnnouncementBanner ({ hideAnnouncement, announcement }: AnnouncementBannerProps): JSX.Element {
  return (
    <ThemedView
      testID='announcements_banner'
      style={tailwind('px-4 py-3 flex-row items-center')}
      light={tailwind('bg-primary-700')}
      dark={tailwind('bg-darkprimary-700')}
    >
      {announcement.id !== undefined &&
      (
        <MaterialIcons
          style={tailwind('mr-2 text-white')}
          iconType='MaterialIcons'
          name='close'
          size={20}
          onPress={() => {
            if (announcement.id === undefined) {
              return
            }
            hideAnnouncement(announcement.id)
          }}
          testID='close_announcement'
        />
      )}

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
  id?: string
}

function findAnnouncementForVersion (version: string, language: string, announcements?: AnnouncementData[]): Announcement | undefined {
  if (announcements === undefined || announcements.length === 0) {
    return
  }

  for (const announcement of announcements) {
    const lang: any = announcement.lang
    const platformUrl: any = announcement.url

    if ((Platform.OS !== 'ios' && Platform.OS !== 'android') ||
      satisfies(version, announcement.version)) {
      return {
        content: lang[language] ?? lang.en,
        url: platformUrl !== undefined ? platformUrl[Platform.OS] : undefined,
        id: announcement.id
      }
    }
  }
}

  /* Logic not used - can delete? */
function getDisplayAnnouncement (hiddenAnnouncements: string[], announcement?: Announcement): boolean {
  if (announcement === undefined) {
    return false
  }

  if (hiddenAnnouncements.length > 0 && announcement.id !== undefined) {
    return !hiddenAnnouncements.includes(announcement.id)
  }

  return true
}
