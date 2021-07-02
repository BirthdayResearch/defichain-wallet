import * as SplashScreen from 'expo-splash-screen'
import React from 'react'
import { Provider } from 'react-redux'
import './_shim'
import { useCachedPlaygroundClient } from './app/api/playground'
import { Logging } from './app/logging'
import { useNetwork } from './hooks/api/useNetwork'
import { useCachedResources } from './hooks/design/useCachedResources'
import { Main } from './screens/Main'
import { store } from './store'
import { initI18n } from './translations'

initI18n()

export default function App (): JSX.Element | null {
  return (
    <Provider store={store}>
      <WalletApp />
    </Provider>
  )
}

function WalletApp (): JSX.Element | null {
  const isLoaded: boolean[] = [
    useCachedResources(),
    useNetwork(),
    useCachedPlaygroundClient()
  ]

  if (isLoaded.includes(false)) {
    SplashScreen.preventAutoHideAsync()
      .catch(Logging.error)
    return null
  }

  SplashScreen.hideAsync()
    .catch(Logging.error)
  return <Main />
}
