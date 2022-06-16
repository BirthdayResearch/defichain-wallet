import { ServiceProviderPersistence } from "@api/persistence/service_provider_persistence"
import { defaultDefichainURL } from "@screens/AppNavigator/screens/Settings/screens/ServiceProviderScreen"
import { useLogger } from "@shared-contexts/NativeLoggingProvider"
import { useEffect, useState } from "react"

interface ServiceProviderURL {
  url: string
  setUrl: (val: string) => void
}

export function useServiceProvider (): ServiceProviderURL {
  const logger = useLogger()
  const [url, setUrl] = useState(defaultDefichainURL)

  useEffect(() => {
    ServiceProviderPersistence.get().then((val: string) => {
      setUrl(val)
    }).catch(logger.error)
  }, [])

  const updateUrl = async (val: string): Promise<void> => {
    setUrl(val)
    await ServiceProviderPersistence.set(val)
  }

  return {
    url, 
    setUrl: updateUrl
  }
}