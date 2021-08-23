import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import './_shim'
import { Logging } from './app/api'
import { DeFiScanProvider } from './app/contexts/DeFiScanContext'
import { NetworkProvider } from './app/contexts/NetworkContext'
import { StatsProvider } from './app/contexts/StatsProvider'
import { StoreProvider } from './app/contexts/StoreProvider'
import { WalletPersistenceProvider } from './app/contexts/WalletPersistenceContext'
import { LocalAuthContextProvider } from './app/contexts/LocalAuthContext'
import { WhaleProvider } from './app/contexts/WhaleContext'
import { useCachedResources } from './app/hooks/useCachedResources'
import ConnectionBoundary from './app/screens/ConnectionBoundary/ConnectionBoundary'
import ErrorBoundary from './app/screens/ErrorBoundary/ErrorBoundary'
import { Main } from './app/screens/Main'
import { initI18n } from './app/translations'

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */
export default function App (): JSX.Element | null {
  initI18n()
  const isLoaded = useCachedResources()

  if (!isLoaded) {
    SplashScreen.preventAutoHideAsync()
      .catch(Logging.error)
    return null
  }

  SplashScreen.hideAsync()
    .catch(Logging.error)

  return (
    <ErrorBoundary>
      <ConnectionBoundary>
        <LocalAuthContextProvider>
          <NetworkProvider>
            <WhaleProvider>
              <DeFiScanProvider>
                <WalletPersistenceProvider>
                  <StoreProvider>
                    <StatsProvider>
                      <Main />
                    </StatsProvider>
                  </StoreProvider>
                </WalletPersistenceProvider>
              </DeFiScanProvider>
            </WhaleProvider>
          </NetworkProvider>
        </LocalAuthContextProvider>
      </ConnectionBoundary>
    </ErrorBoundary>
  )
}
