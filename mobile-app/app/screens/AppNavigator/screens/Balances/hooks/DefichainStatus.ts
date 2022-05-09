import { useCallback, useEffect, useState } from 'react'
import { useGetStatusQuery } from '@store/website'
import { AnnouncementData } from '@shared-types/website'
import dayjs from 'dayjs'

const deFiChainStatusUrl = 'https://status.defichain.com/'
const majorOutageContent: AnnouncementData[] = [{
  lang: {
    en: 'We are currently investigating an unexpected interruption of service.',
    de: 'Wir untersuchen derzeit eine unerwartete Unterbrechung des Dienstes.',
    'zh-Hans': '我们目前正在调查服务意外中断',
    'zh-Hant': '我們目前正在調查服務意外中斷',
    fr: 'Nous enquêtons actuellement sur une interruption de service inattendue.',
    es: 'Estamos investigando una interrupción inseperada del servicio.',
    it: 'Stiamo indagando su un\'inaspettata interruzione del servizio.'
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

const getUpcomingMaintenanceContent = (scheduledUntil: string, scheduledFor: string, id: string): AnnouncementData[] => {
  const scheduledUntilDate = dayjs(scheduledUntil).format('lll')
  const scheduledForDate = dayjs(scheduledFor).format('lll')
  return [{
    lang: {
      en: `There will be a scheduled maintenance on ${scheduledForDate}. Services will be back on ${scheduledUntilDate}`,
      de: `Am ${scheduledForDate} wird es eine planmäßige Wartung geben. Die Dienste werden am ${scheduledUntilDate} wieder zur Verfügung stehen.`,
      'zh-Hans': `将在 ${scheduledForDate} 进行定期维护. 服务将在 ${scheduledUntilDate} 恢复`,
      'zh-Hant': `將在 ${scheduledForDate} 進行定期維護. 服務將在 ${scheduledUntilDate} 恢復`,
      fr: `Il y aura une maintenance programmée le ${scheduledForDate}. Les services seront de nouveau disponibles le ${scheduledUntilDate}.`,
      es: `Habrá un corte por mantenimiento programado el ${scheduledForDate}. Los servicios volverán a estar activos el ${scheduledUntilDate}.`,
      it: `Ci sarà una manutenzione programmata il ${scheduledForDate}. I servizi torneranno online il ${scheduledUntilDate}.`
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
  const formattedDate = dayjs(scheduledUntilDate).format('lll')
  return [{
    lang: {
      en: `Scheduled maintenance is currently ongoing. Services will be back on ${formattedDate}`,
      de: `Eine planmäßige Wartung ist derzeit im Gange. Die Dienste werden am ${formattedDate} wieder zur Verfügung stehen.`,
      'zh-Hans': `目前正在进行已计画的维护。服务将在 ${formattedDate} 恢复`,
      'zh-Hant': `目前正在進行已計畫的維護。服務將在 ${formattedDate} 恢復`,
      fr: `Une maintenance planifiée est actuellement en cours. Les services seront de retour le ${formattedDate}.`,
      es: `Hay un mantenimiento programado en curso. Los servicios volverán a activarse el ${formattedDate}.`,
      it: `La manutenzione programmata è attualmente in corso. I servizi torneranno il ${formattedDate}`
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

  const setAnnouncementAsync = useCallback(async () => {
    setDefichainStatusAnnouncement(isSuccess && status?.status?.description === 'Major Service Outage' ? majorOutageContent : undefined)

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
