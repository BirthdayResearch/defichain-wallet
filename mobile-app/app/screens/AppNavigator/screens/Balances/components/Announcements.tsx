import { ThemedText, ThemedView } from '@components/themed'
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
import { useDefiChainStatus } from '../hooks/DefichainStatus'
import { IconProps } from '@expo/vector-icons/build/createIconSet'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

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

  const {
    defichainStatusAnnouncement: defichainStatusAnnouncementContent,
    maintenanceAnnouncement: maintenanceAnnouncementContent
  } = useDefiChainStatus(hiddenAnnouncements)

  const isBlockchainDown = useBlockchainStatus()
  const deFiChainStatusUrl = 'https://status.defichain.com/'

  const blockChainIsDownContent: AnnouncementData[] = [{
    lang: {
      en: 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.',
      de: 'Wir untersuchen derzeit ein Synchronisierungsproblem der Blockchain. Weitere Details auf der DeFiChain Statusseite.',
      'zh-Hans': '我们目前正在调查区块链上的同步化问题。前往 DeFiChain Status 页面了解更多状态详情。',
      'zh-Hant': '我們目前正在調查區塊鏈上的同步化問題。前往 DeFiChain Status 頁面了解更多狀態詳情。',
      fr: 'Nous enquêtons actuellement sur un problème de synchronisation sur la blockchain. Voir plus de détails sur DeFiChain Status Page.'
    },
    version: '0.0.0',
    url: {
      ios: deFiChainStatusUrl,
      android: deFiChainStatusUrl,
      windows: deFiChainStatusUrl,
      web: deFiChainStatusUrl,
      macos: deFiChainStatusUrl
    },
    type: 'EMERGENCY'
  }]

  const [emergencyMsgContent, setEmergencyMsgContent] = useState<AnnouncementData[] | undefined>()

  const announcement = findDisplayedAnnouncementForVersion(nativeApplicationVersion ?? '0.0.0', language, hiddenAnnouncements, announcements)
  const emergencyAnnouncement = findDisplayedAnnouncementForVersion('0.0.0', language, hiddenAnnouncements, emergencyMsgContent)
  const outageAnnouncement = findDisplayedAnnouncementForVersion('0.0.0', language, hiddenAnnouncements, defichainStatusAnnouncementContent)
  const maintenanceAnnouncement = findDisplayedAnnouncementForVersion('0.0.0', language, hiddenAnnouncements, maintenanceAnnouncementContent)

  /*
    Display priority:
    1. Emergencies
    2. Outages
    3. Maintenance
    4. Other announcements
  */
  const announcementToDisplay = emergencyAnnouncement ?? outageAnnouncement ?? maintenanceAnnouncement ?? announcement

  useEffect(() => {
    // To display warning message in Announcement banner when blockchain is down for > 45 mins
    if (isBlockchainDown) {
      setEmergencyMsgContent(blockChainIsDownContent)
    } else {
      setEmergencyMsgContent(undefined)
    }
  }, [isBlockchainDown])

  if (!isSuccess || announcementToDisplay === undefined) {
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
  const { isLight } = useThemeContext()
  const icons: { [key in AnnouncementData['type']]: IconProps<any>['name'] } = {
    EMERGENCY: 'warning',
    OTHER_ANNOUNCEMENT: 'campaign',
    PARTIAL_OUTAGE: 'warning',
    MAJOR_OUTAGE: 'warning',
    MAINTENANCE: 'warning'
  }
  const isOtherAnnouncement = announcement.type === undefined || announcement.type === 'OTHER_ANNOUNCEMENT'

  return (
    <ThemedView
      testID='announcements_banner'
      style={tailwind('px-4 py-3 flex-row items-center')}
      light={tailwind({
        'bg-primary-700': isOtherAnnouncement,
        'bg-warning-100': !isOtherAnnouncement
      })}
      dark={tailwind({
        'bg-darkprimary-700': isOtherAnnouncement,
        'bg-darkwarning-100': !isOtherAnnouncement
      })}
    >
      {announcement.id !== undefined &&
      (
        <MaterialIcons
          style={tailwind(['mr-1', {
            'text-white': !isLight || isOtherAnnouncement,
            'text-gray-900': !(!isLight || isOtherAnnouncement)
          }])}
          iconType='MaterialIcons'
          name='close'
          size={18}
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
        style={tailwind(['mr-2.5', {
          'text-white': isOtherAnnouncement,
          'text-warning-600': !isOtherAnnouncement && isLight,
          'text-darkwarning-600': !isOtherAnnouncement && !isLight
        }])}
        iconType='MaterialIcons'
        name={icons[announcement.type ?? 'OTHER_ANNOUNCEMENT']}
        size={icons[announcement.type ?? 'OTHER_ANNOUNCEMENT'] === 'warning' ? 24 : 28}
      />
      <Text
        style={tailwind(['text-xs flex-auto', {
          'text-white': !isLight || (isLight && isOtherAnnouncement),
          'text-gray-900': !isOtherAnnouncement && isLight
        }])}
        testID='announcements_text'
      >
        {`${announcement.content} `}
      </Text>
      {announcement.url !== undefined && announcement.url.length !== 0 &&
      (
        <TouchableOpacity
          onPress={async () => await openURL(announcement.url)}
          style={tailwind('ml-2 py-1')}
        >
          <ThemedText
            style={tailwind('text-sm font-medium')}
            light={tailwind({
            'text-white': isOtherAnnouncement,
            'text-warning-600': !isOtherAnnouncement
          })}
            dark={tailwind({
            'text-white': isOtherAnnouncement,
            'text-darkwarning-600': !isOtherAnnouncement
          })}
          >
            {translate('components/Announcements', 'DETAILS')}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  )
}

interface Announcement {
  content: string
  url: string
  id?: string
  type: AnnouncementData['type']
}

function findDisplayedAnnouncementForVersion (version: string, language: string, hiddenAnnouncements: string[], announcements?: AnnouncementData[]): Announcement | undefined {
  if (announcements === undefined || announcements.length === 0) {
    return
  }

  for (const announcement of announcements) {
    const lang: any = announcement.lang
    const platformUrl: any = announcement.url

    if (((Platform.OS !== 'ios' && Platform.OS !== 'android') ||
      satisfies(version, announcement.version)) && getDisplayAnnouncement(hiddenAnnouncements, announcement)) {
      return {
        content: lang[language] ?? lang.en,
        url: platformUrl !== undefined ? platformUrl[Platform.OS] : undefined,
        id: announcement.id,
        type: announcement.type
      }
    }
  }
}

function getDisplayAnnouncement (hiddenAnnouncements: string[], announcement: AnnouncementData): boolean {
  if (announcement === undefined) {
    return false
  }

  if (hiddenAnnouncements.length > 0 && announcement.id !== undefined) {
    return !hiddenAnnouncements.includes(announcement.id)
  }

  return true
}
