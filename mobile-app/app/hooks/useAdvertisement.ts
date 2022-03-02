import { AdvertisementPersistence } from '@api/persistence/advertisement_storage'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useEffect, useState } from 'react'

export interface Advertisement {
  lastAd?: AdvertisementInfo
  setLastAd: (info: AdvertisementInfo) => void
}

export interface AdvertisementInfo {
  id?: string
  date?: string
}

export function useAdvertisement (): Advertisement {
  const logger = useLogger()
  const [lastAd, setLastAd] = useState<AdvertisementInfo>()

  useEffect(() => {
    AdvertisementPersistence.get().then((info) => {
      setLastAd(info)
    }).catch(logger.error)
  }, [])

  const updateLastAd = async (info: AdvertisementInfo): Promise<void> => {
    setLastAd(info)
    await AdvertisementPersistence.set(info)
  }

  return {
    lastAd: lastAd,
    setLastAd: updateLastAd
  }
}
