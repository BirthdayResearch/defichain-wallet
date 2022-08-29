import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useLazyGetAdvertisementQuery } from '@store/website'
import { useEffect, useState } from 'react'
import { useAdvertisement } from '@hooks/useAdvertisement'
import { useLanguageContext } from '@shared-contexts/LanguageProvider'

export function useShowAdvertisement (): { showAd: boolean, counter: number, adUrl: string | undefined } {
  const logger = useLogger()
  const { language } = useLanguageContext()
  const { lastAd, setLastAd } = useAdvertisement()
  const [trigger, result] = useLazyGetAdvertisementQuery()

  const [showAd, setShowAd] = useState(true)
  const [counter, setCounter] = useState(0)
  const [adUrl, setAdUrl] = useState<string | undefined>()
  const [intervalID, setIntervalID] = useState<NodeJS.Timer>() // created a useState for intervalID

  useEffect(() => {
    setIntervalID(setInterval(() => {
      setCounter((c) => {
        if (c - 1 === 0) {
          setShowAd(false)
        }

        return c - 1
      })
    }, 1000))
  }, [])

  useEffect(() => {
    if (counter < 0) {
      setShowAd(false);
      (intervalID != null) && clearInterval(intervalID)
    }
  }, [counter])

  useEffect(() => {
    if (lastAd != null && result.data == null) {
      trigger({ id: lastAd.id, date: lastAd.date, lang: language })
        .then((r) => {
          if (r.data != null) {
            setCounter(r.data.displayTime)
            setAdUrl(r.data.url)
            setLastAd({ id: r.data.id, date: new Date().toISOString() })
          } else {
            setShowAd(false)
          }
        })
        .catch(logger.error)
    }
  }, [lastAd])

  return {
    showAd,
    counter,
    adUrl
  }
}
