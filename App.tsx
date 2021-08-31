import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import './_shim'
import { Logging } from './app/api'
import { AppStateContextProvider } from './app/contexts/AppStateContext'
import { DeFiScanProvider } from './app/contexts/DeFiScanContext'
import { LocalAuthContextProvider } from './app/contexts/LocalAuthContext'
import { NetworkProvider } from './app/contexts/NetworkContext'
import { StatsProvider } from './app/contexts/StatsProvider'
import { StoreProvider } from './app/contexts/StoreProvider'
import { ThemeProvider, useTheme } from './app/contexts/ThemeProvider'
import { WalletPersistenceProvider } from './app/contexts/WalletPersistenceContext'
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
  const { isThemeLoaded } = useTheme()

  if (!isLoaded && !isThemeLoaded) {
    SplashScreen.preventAutoHideAsync()
      .catch(Logging.error)
    return null
  }

  SplashScreen.hideAsync()
    .catch(Logging.error)

  return (
    <ErrorBoundary>
      <AppStateContextProvider>
        <LocalAuthContextProvider>
          <NetworkProvider>
            <WhaleProvider>
              <DeFiScanProvider>
                <WalletPersistenceProvider>
                  <StoreProvider>
                    <StatsProvider>
                      <ThemeProvider>
                        <ConnectionBoundary>
                          <Main />
                        </ConnectionBoundary>
                      </ThemeProvider>
                    </StatsProvider>
                  </StoreProvider>
                </WalletPersistenceProvider>
              </DeFiScanProvider>
            </WhaleProvider>
          </NetworkProvider>
        </LocalAuthContextProvider>
      </AppStateContextProvider>
    </ErrorBoundary>
  )
}
