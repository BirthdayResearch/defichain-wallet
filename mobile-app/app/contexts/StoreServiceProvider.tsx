import { useNetworkContext } from '@shared-contexts/NetworkContext';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { initializeStore, RootState } from '@store' 
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext';
import { ServiceProviderURL } from '@store/serviceProvider';
import { useLogger } from '@shared-contexts/NativeLoggingProvider';
import { defaultDefichainURL } from '@screens/AppNavigator/screens/Settings/screens/ServiceProviderScreen';

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
  }, [])

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

export function StoreServiceProvider (props: ServiceProviderURL & PropsWithChildren<any>): JSX.Element {
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