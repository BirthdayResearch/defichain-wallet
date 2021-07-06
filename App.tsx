import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { Provider } from 'react-redux'
import './_shim'
import { NetworkContainer } from './app/contexts/NetworkContext'
import { PlaygroundContainer, useConnectedPlayground } from './app/contexts/PlaygroundContext'
import { WhaleContainer } from './app/contexts/WhaleContext'
import { useCachedResources } from './app/hooks/useCachedResources'
import { Logging } from './app/middlewares/logging'
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
    <NetworkContainer>
      <PlaygroundContainer>
        <WhaleContainer>
          <Provider store={store}>
            <Main />
          </Provider>
        </WhaleContainer>
      </PlaygroundContainer>
    </NetworkContainer>
  )
}
