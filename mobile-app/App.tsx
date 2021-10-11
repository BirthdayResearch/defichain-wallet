import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import './_shim'
import { Logging, SecuredStoreAPI, LanguagePersistence } from '@api'
import { AppStateContextProvider } from '@contexts/AppStateContext'
import { DeFiScanProvider } from '@shared-contexts/DeFiScanContext'
import { PrivacyLockContextProvider } from '@contexts/LocalAuthContext'
import { NetworkProvider } from '@shared-contexts/NetworkContext'
import { StatsProvider } from '@shared-contexts/StatsProvider'
import { StoreProvider } from '@contexts/StoreProvider'
import { ThemeProvider, useTheme } from '@contexts/ThemeProvider'
import { WalletPersistenceProvider } from '@contexts/WalletPersistenceContext'
import { WhaleProvider } from '@contexts/WhaleContext'
import { useCachedResources } from '@hooks/useCachedResources'
import ConnectionBoundary from '@screens/ConnectionBoundary/ConnectionBoundary'
import ErrorBoundary from '@screens/ErrorBoundary/ErrorBoundary'
import { Main } from '@screens/Main'
import { LanguageProvider, useLanguage } from '@shared-contexts/LanguageProvider'

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */

// eslint-disable-next-line import/no-default-export
export default function App (): JSX.Element | null {
  const isLoaded = useCachedResources()
  const { isThemeLoaded } = useTheme()
  const { isLanguageLoaded } = useLanguage({ api: LanguagePersistence, log: Logging })

  if (!isLoaded && !isThemeLoaded && !isLanguageLoaded) {
    SplashScreen.preventAutoHideAsync()
      .catch(Logging.error)
    return null
  }

  SplashScreen.hideAsync()
    .catch(Logging.error)

  return (
    <ErrorBoundary>
      <AppStateContextProvider>
        <PrivacyLockContextProvider>
          <NetworkProvider api={SecuredStoreAPI} log={Logging}>
            <WhaleProvider>
              <DeFiScanProvider>
                <WalletPersistenceProvider>
                  <StoreProvider>
                    <StatsProvider log={Logging}>
                      <ThemeProvider>
                        <LanguageProvider api={LanguagePersistence} log={Logging}>
                          <ConnectionBoundary>
                            <Main />
                          </ConnectionBoundary>
                        </LanguageProvider>
                      </ThemeProvider>
                    </StatsProvider>
                  </StoreProvider>
                </WalletPersistenceProvider>
              </DeFiScanProvider>
            </WhaleProvider>
          </NetworkProvider>
        </PrivacyLockContextProvider>
      </AppStateContextProvider>
    </ErrorBoundary>
  )
}
