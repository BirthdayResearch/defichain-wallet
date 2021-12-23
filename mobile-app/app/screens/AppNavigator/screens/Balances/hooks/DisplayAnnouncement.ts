import { DisplayAnnouncementPersistence } from '@api/persistence/display_announcement_storage'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useEffect, useState } from 'react'

export interface DisplayAnnouncement {
  hiddenAnnouncements: string[]
  hideAnnouncement: (id: string) => void
}

export interface AnnouncementFlag {
  id: string
  displayAnnouncement: boolean
}

export function useDisplayAnnouncement (): DisplayAnnouncement {
  const logger = useLogger()
  const [hiddenAnnouncements, setHiddenAnnouncements] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    DisplayAnnouncementPersistence.get().then((flag: string[]) => {
      if (!mounted) {
        return
      }
      setHiddenAnnouncements(flag)
    }).catch(logger.error)
    return () => {
      mounted = false
    }
  }, [])

  const hideAnnouncement = async (id: string): Promise<void> => {
    if (hiddenAnnouncements.includes(id)) {
      return
    }

    hiddenAnnouncements.push(id)
    setHiddenAnnouncements([...hiddenAnnouncements])
    await DisplayAnnouncementPersistence.set(hiddenAnnouncements)
  }

  return {
    hiddenAnnouncements,
    hideAnnouncement
  }
}
