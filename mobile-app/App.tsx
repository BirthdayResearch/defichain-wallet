import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import './_shim'
import { Logging } from '@api'
import { AppStateContextProvider } from '@contexts/AppStateContext'
import { DeFiScanProvider } from '@contexts/DeFiScanContext'
import { DisplayBalancesProvider } from '@contexts/DisplayBalancesContext'
import { PrivacyLockContextProvider } from '@contexts/LocalAuthContext'
import { NetworkProvider } from '@contexts/NetworkContext'
import { StatsProvider } from '@contexts/StatsProvider'
import { StoreProvider } from '@contexts/StoreProvider'
import { ThemeProvider, useTheme } from '@contexts/ThemeProvider'
import { WalletPersistenceProvider } from '@contexts/WalletPersistenceContext'
import { WhaleProvider } from '@contexts/WhaleContext'
import { useCachedResources } from '@hooks/useCachedResources'
import ConnectionBoundary from '@screens/ConnectionBoundary/ConnectionBoundary'
import ErrorBoundary from '@screens/ErrorBoundary/ErrorBoundary'
import { Main } from '@screens/Main'
import { LanguageProvider, useLanguage } from '@contexts/LanguageProvider'

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */

// eslint-disable-next-line import/no-default-export
export default function App (): JSX.Element | null {
  const isLoaded = useCachedResources()
  const { isThemeLoaded } = useTheme()
  const { isLanguageLoaded } = useLanguage()

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
          <NetworkProvider>
            <WhaleProvider>
              <DeFiScanProvider>
                <WalletPersistenceProvider>
                  <StoreProvider>
                    <StatsProvider>
                      <ThemeProvider>
                        <LanguageProvider>
                          <DisplayBalancesProvider>
                            <ConnectionBoundary>
                              <Main />
                            </ConnectionBoundary>
                          </DisplayBalancesProvider>
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
