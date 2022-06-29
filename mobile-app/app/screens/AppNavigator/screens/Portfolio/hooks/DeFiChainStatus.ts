import { useCallback, useEffect, useState } from 'react'
import { AnnouncementData } from '@shared-types/website'
import { useApiStatus } from '@hooks/useApiStatus'

const deFiChainStatusUrl = 'https://status.defichain.com/'

// TODO: get translations
const oceanIsDownContent: AnnouncementData[] = [{
  lang: {
    en: 'We are currently investigating connection issues on Ocean API. View more details on the DeFiChain Status Page.',
    de: 'Zurzeit untersuchen wir die Verbindungsprobleme auf der Ocean API. Weitere Details auf der DeFiChain Statusseite.',
    'zh-Hans': '我们目前正在调查 Ocean API 的连接问题。在 DeFiChain 状态页面上查看更多详细信息。',
    'zh-Hant': '我們目前正在調查 Ocean API 的連接問題。 在 DeFiChain 狀態頁面上查看更多詳細信息。',
    fr: 'Nous enquêtons actuellement sur des problèmes de connexion sur Ocean API. Voir plus de détails sur la page DeFiChain Status.',
    es: 'We are currently investigating connection issues on Ocean API. View more details on the DeFiChain Status Page.',
    it: 'We are currently investigating connection issues on Ocean API. View more details on the DeFiChain Status Page.'
  },
  version: '0.0.0',
  url: {
    ios: deFiChainStatusUrl,
    android: deFiChainStatusUrl,
    windows: deFiChainStatusUrl,
    web: deFiChainStatusUrl,
    macos: deFiChainStatusUrl
  },
  type: 'OUTAGE'
}]

export const blockChainIsDownContent: AnnouncementData[] = [{
  lang: {
    en: 'We are currently investigating a syncing issue on the blockchain. View more details on the DeFiChain Status Page.',
    de: 'Wir untersuchen derzeit ein Synchronisierungsproblem der Blockchain. Weitere Details auf der DeFiChain Statusseite.',
    'zh-Hans': '我们目前正在调查区块链上的同步化问题。前往 DeFiChain Status 页面了解更多状态详情。',
    'zh-Hant': '我們目前正在調查區塊鏈上的同步化問題。前往 DeFiChain Status 頁面了解更多狀態詳情。',
    fr: 'Nous enquêtons actuellement sur un problème de synchronisation sur la blockchain. Voir plus de détails sur DeFiChain Status Page.',
    es: 'Estamos investigando un problema de sincronización en la blockchain. Más detalles en la pagina de estado de DeFiChain',
    it: 'Stiamo indagando su un problema di sincronizzazione della blockchain. Vedi maggiori dettagli sulla pagina di stato di DeFiChain.'
  },
  version: '0.0.0',
  url: {
    ios: deFiChainStatusUrl,
    android: deFiChainStatusUrl,
    windows: deFiChainStatusUrl,
    web: deFiChainStatusUrl,
    macos: deFiChainStatusUrl
  },
  type: 'OUTAGE'
}]

export function useDeFiChainStatus (hiddenAnnouncements: string[]): {
  blockchainStatusAnnouncement: AnnouncementData[] | undefined
  oceanStatusAnnouncement: AnnouncementData[] | undefined
} {
  const [oceanStatusAnnouncement, setOceanStatusAnnouncement] = useState<AnnouncementData[] | undefined>()
  const [blockchainStatusAnnouncement, setBlockchainStatusAnnouncement] = useState<AnnouncementData[] | undefined>()

  const {
    isBlockchainDown,
    isOceanDown
  } = useApiStatus()

  const setAnnouncementAsync = useCallback(async () => {
    if (isBlockchainDown) {
      return setBlockchainStatusAnnouncement(blockChainIsDownContent)
    } else if (isOceanDown) {
      return setOceanStatusAnnouncement(oceanIsDownContent)
    } else {
      setBlockchainStatusAnnouncement(undefined)
      setOceanStatusAnnouncement(undefined)
    }
  }, [isBlockchainDown, isOceanDown])

  useEffect(() => {
    void setAnnouncementAsync()
  }, [setAnnouncementAsync])

  return {
    blockchainStatusAnnouncement,
    oceanStatusAnnouncement
  }
}
