import * as SplashScreen from 'expo-splash-screen'
import './_shim'
import { SecuredStoreAPI, LanguagePersistence, ThemePersistence } from '@api'
import { AppStateContextProvider } from '@contexts/AppStateContext'
import { DeFiScanProvider } from '@shared-contexts/DeFiScanContext'
import { DisplayBalancesProvider } from '@contexts/DisplayBalancesContext'
import { PrivacyLockContextProvider } from '@contexts/LocalAuthContext'
import { NetworkProvider } from '@shared-contexts/NetworkContext'
import { StatsProvider } from '@shared-contexts/StatsProvider'
import { StoreProvider } from '@contexts/StoreProvider'
import { ThemeProvider, useTheme } from '@shared-contexts/ThemeProvider'
import { WalletPersistenceProvider } from '@shared-contexts/WalletPersistenceContext'
import { WhaleProvider } from '@shared-contexts/WhaleContext'
import { useCachedResources } from '@hooks/useCachedResources'
import ConnectionBoundary from '@screens/ConnectionBoundary/ConnectionBoundary'
import ErrorBoundary from '@screens/ErrorBoundary/ErrorBoundary'
import { Main } from '@screens/Main'
import { LanguageProvider, useLanguage } from '@shared-contexts/LanguageProvider'
import * as Localization from 'expo-localization'
import { useColorScheme } from 'react-native'
import { WalletPersistence } from '@api/wallet'
import { NativeLoggingProvider, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { FeatureFlagProvider } from '@contexts/FeatureFlagContext'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { tailwind } from '@tailwind'
import { WalletDataProvider } from '@shared-contexts/WalletDataProvider'
import { ToastProvider } from 'react-native-toast-notifications'
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast'
import { WalletToast } from '@components/WalletToast'

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */

// eslint-disable-next-line import/no-default-export
export default function App (): JSX.Element | null {
  const isLoaded = useCachedResources()
  const colorScheme = useColorScheme()
  const logger = useLogger()

  const { isThemeLoaded } = useTheme({
    api: ThemePersistence,
    colorScheme
  })
  const { isLanguageLoaded } = useLanguage({
    api: LanguagePersistence,
    locale: Localization.locale
  })

  if (!isLoaded && !isThemeLoaded && !isLanguageLoaded) {
    SplashScreen.preventAutoHideAsync()
      .catch(logger.error)
    return null
  }

  SplashScreen.hideAsync()
    .catch(logger.error)

  const customToast = {
    wallet_toast: (toast: ToastProps) => (
      <WalletToast toast={toast} />
    )
  }

  return (
    <NativeLoggingProvider>
      <ErrorBoundary>
        <AppStateContextProvider>
          <PrivacyLockContextProvider>
            <NetworkProvider api={SecuredStoreAPI}>
              <WhaleProvider>
                <DeFiScanProvider>
                  <WalletPersistenceProvider api={{ ...WalletPersistence, ...WalletAddressIndexPersistence }}>
                    <StoreProvider>
                      <StatsProvider>
                        <FeatureFlagProvider>
                          <WalletDataProvider>
                            <ThemeProvider api={ThemePersistence} colorScheme={colorScheme}>
                              <LanguageProvider api={LanguagePersistence} locale={Localization.locale}>
                                <DisplayBalancesProvider>
                                  <ConnectionBoundary>
                                    <GestureHandlerRootView style={tailwind('flex-1')}>
                                      <ToastProvider renderType={customToast}>
                                        <Main />
                                      </ToastProvider>
                                    </GestureHandlerRootView>
                                  </ConnectionBoundary>
                                </DisplayBalancesProvider>
                              </LanguageProvider>
                            </ThemeProvider>
                          </WalletDataProvider>
                        </FeatureFlagProvider>
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
