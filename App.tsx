import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { Provider } from 'react-redux'
import './_shim'
import { useCachedResources } from './app/hooks/useCachedResources'
import { useCachedPlaygroundClient } from './app/middlewares/api/playground'
import { useCachedWhaleClient } from './app/middlewares/api/whale'
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
    useCachedPlaygroundClient()
  ]

  if (isLoaded.includes(false)) {
    SplashScreen.preventAutoHideAsync()
      .catch(Logging.error)
    return null
  }

  SplashScreen.hideAsync()
    .catch(Logging.error)

  return (
    <Provider store={store}>
      <WalletApp />
    </Provider>
  )
}

/**
 * Loads
 * - CachedWhaleClient: must be loaded after CachedPlaygroundClient
 */
function WalletApp (): JSX.Element | null {
  const isLoaded: boolean[] = [
    useCachedWhaleClient()
  ]

  if (isLoaded.includes(false)) {
    return null
  }

  return <Main />
}
