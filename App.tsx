import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import './_shim'
import { Logging } from './app/api'
import { DeFiScanProvider } from './app/contexts/DeFiScanContext'
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

// eslint-disable-next-line import/no-default-export
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
    </ErrorBoundary>
  )
}
