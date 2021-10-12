import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import './_shim'
import { Logging, SecuredStoreAPI, LanguagePersistence, ThemePersistence } from '@api'
import { AppStateContextProvider } from '@contexts/AppStateContext'
import { DeFiScanProvider } from '@shared-contexts/DeFiScanContext'
import { PrivacyLockContextProvider } from '@contexts/LocalAuthContext'
import { NetworkProvider } from '@shared-contexts/NetworkContext'
import { StatsProvider } from '@shared-contexts/StatsProvider'
import { StoreProvider } from '@contexts/StoreProvider'
import { ThemeProvider, useTheme } from '@shared-contexts/ThemeProvider'
import { WalletPersistenceProvider } from '@contexts/WalletPersistenceContext'
import { WhaleProvider } from '@shared-contexts/WhaleContext'
import { useCachedResources } from '@hooks/useCachedResources'
import ConnectionBoundary from '@screens/ConnectionBoundary/ConnectionBoundary'
import ErrorBoundary from '@screens/ErrorBoundary/ErrorBoundary'
import { Main } from '@screens/Main'
import { LanguageProvider, useLanguage } from '@shared-contexts/LanguageProvider'
import * as Localization from 'expo-localization'
import { useColorScheme } from 'react-native'

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */

// eslint-disable-next-line import/no-default-export
export default function App (): JSX.Element | null {
  const isLoaded = useCachedResources()
  const colorScheme = useColorScheme()

  const { isThemeLoaded } = useTheme({ api: ThemePersistence, log: Logging, colorScheme })
  const { isLanguageLoaded } = useLanguage({ api: LanguagePersistence, log: Logging, locale: Localization.locale })

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
          <NetworkProvider api={SecuredStoreAPI} log={Logging} locale={Localization.locale}>
            <WhaleProvider>
              <DeFiScanProvider>
                <WalletPersistenceProvider>
                  <StoreProvider>
                    <StatsProvider log={Logging}>
                      <ThemeProvider api={ThemePersistence} log={Logging} colorScheme={colorScheme}>
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
