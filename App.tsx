import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import './_shim'
import { Logging } from './app/api'
import { DeFiScanProvider } from './app/contexts/DeFiScanContext'
import { NetworkProvider } from './app/contexts/NetworkContext'
import { PlaygroundProvider, useConnectedPlayground } from './app/contexts/PlaygroundContext'
import { WalletPersistenceProvider } from './app/contexts/WalletPersistenceContext'
import { WalletStoreProvider } from './app/contexts/WalletStoreProvider'
import { WhaleProvider } from './app/contexts/WhaleContext'
import { useCachedResources } from './app/hooks/useCachedResources'
import ErrorBoundary from './app/screens/ErrorBoundary/ErrorBoundary'
import { Main } from './app/screens/Main'
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
    // TODO(fuxingloh): feel like we should deprecate to auto resolve to a fixed network
    //  instead of automated resolution, after setup we switch to one based on the test?
    //  might be difficult due to ci automation?
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
            <WalletPersistenceProvider>
              <DeFiScanProvider>
                <WalletStoreProvider>
                  <Main />
                </WalletStoreProvider>
              </DeFiScanProvider>
            </WalletPersistenceProvider>
          </WhaleProvider>
        </PlaygroundProvider>
      </NetworkProvider>
    </ErrorBoundary>
  )
}
