import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useLogger } from '@shared-contexts/NativeLoggingProvider';

export const defaultDefichainURL = 'https://ocean.defichain.com'
interface ServiceProviderLoader {
  isUrlLoaded: boolean
  url: NonNullable<string>
}

interface ServiceProviderURLI {
  api: {
    get: () => Promise<string | null>
    set: (url: NonNullable<string>) => Promise<void>
  },
}

export function useServiceProviderUrl ({ api }: ServiceProviderURLI): ServiceProviderLoader {
  const logger = useLogger()
  const [isUrlLoaded, setIsUrlLoaded] = useState<boolean>(false)
  const [url, setUrl] = useState<NonNullable<string>>(defaultDefichainURL)

  useEffect(() => {
    api.get().then((val) => {
      let currentUrl: NonNullable<string> = defaultDefichainURL
      if (val !== null) {
        currentUrl = val
      }
      setUrl(currentUrl)
    })
    .catch((err) => logger.error(err))
    .finally(() => setIsUrlLoaded(true))
  }, [url])

  return {
    isUrlLoaded, 
    url
  }
}

interface ServiceProviderUrl {
  url: NonNullable<string>
  setUrl: (val: NonNullable<string>) => Promise<void>
}

const ServiceProviderContext = createContext<ServiceProviderUrl>(undefined as any)

export function useServiceProviderContext (): ServiceProviderUrl {
  return useContext(ServiceProviderContext)
}

export function StoreServiceProvider (props: ServiceProviderURLI & PropsWithChildren<any>): JSX.Element | null {
  const { api } = props
  const { url } = useServiceProviderUrl({ api })
  const [currentUrl, setCurrentUrl] = useState<NonNullable<string>>(url)
  
  useEffect(() => {
    setCurrentUrl(url)
  }, [url])

  const setUrl = async (url: string): Promise<void> => {
    setCurrentUrl(url)
    await api.set(url)
  }

  const context: ServiceProviderUrl = {
    url: currentUrl,
    setUrl
  }

  return (
    <ServiceProviderContext.Provider value={context}>
      {props.children}
    </ServiceProviderContext.Provider>
  )
}