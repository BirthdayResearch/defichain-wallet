import React from 'react'
import './_shim'
import { SecuredStoreAPI, LanguagePersistence, ThemePersistence } from '@api'
import { AppStateContextProvider } from '@contexts/AppStateContext'
import { DeFiScanProvider } from '@shared-contexts/DeFiScanContext'
import { DisplayBalancesProvider } from '@contexts/DisplayBalancesContext'
import { PrivacyLockContextProvider } from '@contexts/LocalAuthContext'
import { NetworkProvider } from '@shared-contexts/NetworkContext'
import { StatsProvider } from '@shared-contexts/StatsProvider'
import { StoreProvider } from '@contexts/StoreProvider'
import { ThemeProvider } from '@shared-contexts/ThemeProvider'
import { WalletPersistenceProvider } from '@shared-contexts/WalletPersistenceContext'
import { WhaleProvider } from '@shared-contexts/WhaleContext'
import { useCachedResources } from '@hooks/useCachedResources'
import ConnectionBoundary from '@screens/ConnectionBoundary/ConnectionBoundary'
import ErrorBoundary from '@screens/ErrorBoundary/ErrorBoundary'
import { Main } from '@screens/Main'
import { LanguageProvider } from '@shared-contexts/LanguageProvider'
import * as Localization from 'expo-localization'
import { useColorScheme } from 'react-native'
import { WalletPersistence } from '@api/wallet'
import { NativeLoggingProvider } from '@shared-contexts/NativeLoggingProvider'
import { FeatureFlagProvider } from '@contexts/FeatureFlagContext'

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */

// eslint-disable-next-line import/no-default-export
export default function App (): JSX.Element | null {
  useCachedResources()
  const colorScheme = useColorScheme()

  return (
    <NativeLoggingProvider>
      <ErrorBoundary>
        <AppStateContextProvider>
          <PrivacyLockContextProvider>
            <NetworkProvider api={SecuredStoreAPI}>
              <WhaleProvider>
                <DeFiScanProvider>
                  <WalletPersistenceProvider api={WalletPersistence}>
                    <StoreProvider>
                      <StatsProvider>
                        <ThemeProvider api={ThemePersistence} colorScheme={colorScheme}>
                          <LanguageProvider api={LanguagePersistence} locale={Localization.locale}>
                            <DisplayBalancesProvider>
                              <ConnectionBoundary>
                                <FeatureFlagProvider>
                                  <Main />
                                </FeatureFlagProvider>
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
    </NativeLoggingProvider>
  )
}
