import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { Provider as StoreProvider } from 'react-redux'
import './_shim'
import { Logging } from './app/api/logging'
import { NetworkProvider } from './app/contexts/NetworkContext'
import { PlaygroundProvider, useConnectedPlayground } from './app/contexts/PlaygroundContext'
import { WalletManagementProvider } from './app/contexts/WalletManagementContext'
import { WhaleProvider } from './app/contexts/WhaleContext'
import { useCachedResources } from './app/hooks/useCachedResources'
import ErrorBoundary from './app/screens/ErrorBoundary/ErrorBoundary'
import { Main } from './app/screens/Main'
import { store } from './app/store'
import { initI18n } from './app/translations'

initI18n()

/**
 * Loads
 * - CachedResources
 * - CachedPlaygroundClient
 */
export default function App (): JSX.Element | null {
  const isLoaded: boolean[] = [
    useCachedResources(),
    // find a connected playground at app load
    useConnectedPlayground()
  ]

  if (isLoaded.includes(false)) {
    SplashScreen.preventAutoHideAsync()
      .catch(Logging.error)
    return null
  }

  SplashScreen.hideAsync()
    .catch(Logging.error)

  return (
    <ErrorBoundary>
      <NetworkProvider>
        <PlaygroundProvider>
          <WhaleProvider>
            <WalletManagementProvider>
              <StoreProvider store={store}>
                <Main />
              </StoreProvider>
            </WalletManagementProvider>
          </WhaleProvider>
        </PlaygroundProvider>
      </NetworkProvider>
    </ErrorBoundary>
  )
}
