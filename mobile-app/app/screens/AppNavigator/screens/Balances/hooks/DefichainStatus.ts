import { useCallback, useEffect, useState } from 'react'
import { useGetStatusQuery } from '@store/website'
import { AnnouncementData } from '@shared-types/website'
import dayjs from 'dayjs'
import { DisplayAnnouncementPersistence } from '@api/persistence/display_announcement_storage'

const deFiChainStatusUrl = 'https://status.defichain.com/'
const majorOutageContent: AnnouncementData[] = [{
  id: 'major_outage',
  lang: {
    en: 'We are currently investigating an unexpected interruption of service.',
    de: 'We are currently investigating an unexpected interruption of service.',
    'zh-Hans': 'We are currently investigating an unexpected interruption of service.',
    'zh-Hant': 'We are currently investigating an unexpected interruption of service.',
    fr: 'We are currently investigating an unexpected interruption of service.'
  },
  version: '0.0.0',
  url: {
    ios: deFiChainStatusUrl,
    android: deFiChainStatusUrl,
    windows: deFiChainStatusUrl,
    web: deFiChainStatusUrl,
    macos: deFiChainStatusUrl
  },
  type: 'MAJOR_OUTAGE'
}]
const partialOutageContent: AnnouncementData[] = [{
  id: 'partial_outage',
  lang: {
    en: 'We are currently investigating an unexpected interruption of service.',
    de: 'We are currently investigating an unexpected interruption of service.',
    'zh-Hans': 'We are currently investigating an unexpected interruption of service.',
    'zh-Hant': 'We are currently investigating an unexpected interruption of service.',
    fr: 'We are currently investigating an unexpected interruption of service.'
  },
  version: '0.0.0',
  url: {
    ios: deFiChainStatusUrl,
    android: deFiChainStatusUrl,
    windows: deFiChainStatusUrl,
    web: deFiChainStatusUrl,
    macos: deFiChainStatusUrl
  },
  type: 'PARTIAL_OUTAGE'
}]

const getUpcomingMaintenanceContent = (scheduledUntil: string, scheduledFor: string, id: string): AnnouncementData[] => {
  const scheduledUntilDate = dayjs(scheduledUntil).format('dd/mm/yyyy hh:mm a')
  const scheduledForDate = dayjs(scheduledFor).format('dd/mm/yyyy hh:mm a')
  return [{
    id: `upcoming_maintenance_${id}`,
    lang: {
      en: `There will be a scheduled maintenance on ${scheduledForDate}. Services will be back on ${scheduledUntilDate}`,
      de: `There will be a scheduled maintenance on ${scheduledForDate}. Services will be back on ${scheduledUntilDate}`,
      'zh-Hans': `There will be a scheduled maintenance on ${scheduledForDate}. Services will be back on ${scheduledUntilDate}`,
      'zh-Hant': `There will be a scheduled maintenance on ${scheduledForDate}. Services will be back on ${scheduledUntilDate}`,
      fr: `There will be a scheduled maintenance on ${scheduledForDate}. Services will be back on ${scheduledUntilDate}`
    },
    version: '0.0.0',
    url: {
      ios: deFiChainStatusUrl,
      android: deFiChainStatusUrl,
      windows: deFiChainStatusUrl,
      web: deFiChainStatusUrl,
      macos: deFiChainStatusUrl
    },
    type: 'MAINTENANCE'
  }]
}

const getOngoingMaintenanceContent = (scheduledUntilDate: string, id: string): AnnouncementData[] => {
  const formattedDate = dayjs(scheduledUntilDate).format('dd/mm/yyyy hh:mm a')
  return [{
    id: `ongoing_maintenance_${id}`,
    lang: {
      en: `Scheduled maintenance is currently ongoing. Services will be back on ${formattedDate}`,
      de: `Scheduled maintenance is currently ongoing. Services will be back on ${formattedDate}`,
      'zh-Hans': `Scheduled maintenance is currently ongoing. Services will be back on ${formattedDate}`,
      'zh-Hant': `Scheduled maintenance is currently ongoing. Services will be back on ${formattedDate}`,
      fr: `Scheduled maintenance is currently ongoing. Services will be back on ${formattedDate}`
    },
    version: '0.0.0',
    url: {
      ios: deFiChainStatusUrl,
      android: deFiChainStatusUrl,
      windows: deFiChainStatusUrl,
      web: deFiChainStatusUrl,
      macos: deFiChainStatusUrl
    },
    type: 'MAINTENANCE'
  }]
}

export function useDefiChainStatus (hiddenAnnouncements: string[]): {
  defichainStatusAnnouncement: AnnouncementData[] | undefined
  maintenanceAnnouncement: AnnouncementData[] | undefined
} {
  const [defichainStatusAnnouncement, setDefichainStatusAnnouncement] = useState<AnnouncementData[] | undefined>()
  const [maintenanceAnnouncement, setMaintenanceAnnouncement] = useState<AnnouncementData[] | undefined>()
  const {
    data: status,
    isSuccess
  } = useGetStatusQuery({}, {
    pollingInterval: 1000 * 60 * 5 // every 5mins
  })

  const resetStatusAnnouncement = async (): Promise<void> => {
    setDefichainStatusAnnouncement(undefined)
    await DisplayAnnouncementPersistence.set(hiddenAnnouncements.filter(announcement => announcement !== 'major_outage' && announcement !== 'partial_outage')).catch()
  }

  const setAnnouncementAsync = useCallback(async () => {
    if (isSuccess && status?.status?.description === 'All Systems Operational') {
      await resetStatusAnnouncement()
    } else if (isSuccess && status?.status?.description === 'Major Service Outage') {
      setDefichainStatusAnnouncement(majorOutageContent)
    } else if (isSuccess && status?.status?.description === 'Partial System Outage') {
      setDefichainStatusAnnouncement(partialOutageContent)
    } else {
      setDefichainStatusAnnouncement(undefined)
    }

    /* Display upcoming maintenance 24 hours before schedule and when it starts */
    const inProgressMaintenance = status?.scheduled_maintenances.find(maintenance => maintenance.status === 'In Progress')
    const upcomingMaintenance = status?.scheduled_maintenances.find(maintenance =>
      maintenance.status.toLowerCase() === 'scheduled' &&
      dayjs(new Date()).diff(maintenance.scheduled_for, 'hours') < 24
      )

    if (isSuccess && inProgressMaintenance !== undefined) {
      setMaintenanceAnnouncement(getOngoingMaintenanceContent(inProgressMaintenance.scheduled_until, inProgressMaintenance.id))
    } else if (isSuccess && upcomingMaintenance !== undefined) {
      setMaintenanceAnnouncement(getUpcomingMaintenanceContent(upcomingMaintenance.scheduled_until, upcomingMaintenance.scheduled_for, upcomingMaintenance.id))
    } else {
      setMaintenanceAnnouncement(undefined)
    }
  }, [isSuccess, status?.status?.description, status?.scheduled_maintenances])

  useEffect(() => {
    void setAnnouncementAsync()
  }, [setAnnouncementAsync])

  return {
    defichainStatusAnnouncement,
    maintenanceAnnouncement
  }
}
