import { useEffect, useState } from 'react'
import { useGetStatusQuery } from '@store/website'
import { AnnouncementData } from '@shared-types/website'
import dayjs from 'dayjs'

const deFiChainStatusUrl = 'https://status.defichain.com/'
const majorOutageContent: AnnouncementData[] = [{
  id: 'major_outage',
  lang: {
    en: 'The defichain has Major Service Outage. See full details in status.defichain.com',
    de: 'The defichain has Major Service Outage. See full details in status.defichain.com',
    'zh-Hans': 'The defichain has Major Service Outage. See full details in status.defichain.com',
    'zh-Hant': 'The defichain has Major Service Outage. See full details in status.defichain.com',
    fr: 'The defichain has Major Service Outage. See full details in status.defichain.com'
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
    en: 'The defichain has Partial Service Outage. See full details in status.defichain.com',
    de: 'The defichain has Partial Service Outage. See full details in status.defichain.com',
    'zh-Hans': 'The defichain has Partial Service Outage. See full details in status.defichain.com',
    'zh-Hant': 'The defichain has Partial Service Outage. See full details in status.defichain.com',
    fr: 'The defichain has Partial Service Outage. See full details in status.defichain.com'
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

const getUpcomingMaintenanceContent = (date: string, id: string): AnnouncementData[] => {
  const formattedDate = dayjs(date).format('MM/DD/YYYY h:mm')
  return [{
    id: `upcoming_maintenance_${id}`,
    lang: {
      en: `An Upcoming maintenance is due on ${formattedDate}`,
      de: `An Upcoming maintenance is due on ${formattedDate}`,
      'zh-Hans': `An Upcoming maintenance is due on ${formattedDate}`,
      'zh-Hant': `An Upcoming maintenance is due on ${formattedDate}`,
      fr: `An Upcoming maintenance is due on ${formattedDate}`
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

const getOngoingMaintenanceContent = (date: string, id: string): AnnouncementData[] => {
  const formattedDate = dayjs(date).format('MM/DD/YYYY h:mm')
  return [{
    id: `ongoing_maintenance_${id}`,
    lang: {
      en: `There a scheduled maintenance (${formattedDate}) is ongoing`,
      de: `There a scheduled maintenance (${formattedDate}) is ongoing`,
      'zh-Hans': `There a scheduled maintenance (${formattedDate}) is ongoing`,
      'zh-Hant': `There a scheduled maintenance (${formattedDate}) is ongoing`,
      fr: `There a scheduled maintenance (${formattedDate}) is ongoing`
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

export function useDefiChainStatus (): {
  defichainStatusAnnouncement: AnnouncementData[] | undefined
  maintenanceAnnouncement: AnnouncementData[] | undefined
} {
  const [defichainStatusAnnouncement, setDefichainStatusAnnouncement] = useState<AnnouncementData[] | undefined>()
  const [maintenanceAnnouncement, setMaintenanceAnnouncement] = useState<AnnouncementData[] | undefined>()
  const {
    data: status,
    isSuccess
  } = useGetStatusQuery({})

  useEffect(() => {
    if (isSuccess && status?.status?.description === 'All Systems Operational') {
      setDefichainStatusAnnouncement(undefined)
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
      setMaintenanceAnnouncement(getOngoingMaintenanceContent(inProgressMaintenance.scheduled_for, inProgressMaintenance.id))
    } else if (isSuccess && upcomingMaintenance !== undefined) {
      setMaintenanceAnnouncement(getUpcomingMaintenanceContent(upcomingMaintenance.scheduled_for, upcomingMaintenance.id))
    } else {
      setMaintenanceAnnouncement(undefined)
    }
  }, [isSuccess, status?.status?.description, status?.scheduled_maintenances])

  return {
    defichainStatusAnnouncement,
    maintenanceAnnouncement
  }
}
