import React from 'react'
import { Provider } from 'react-redux'
import { store } from './store'

import useCachedResources from './hooks/useCachedResources'
import useDeFiPlayground from './hooks/defi/useDeFiPlayground'
import useDeFiWhale from './hooks/defi/useDeFiWhale'

import { initI18n } from './translations'
import { Main } from './screens/Main'

initI18n()

export default function App (): JSX.Element | null {
  const isLoadingComplete = [
    useCachedResources(),
    useDeFiPlayground(),
    useDeFiWhale()
  ]

  if (isLoadingComplete.includes(false)) {
    return null
  }

  return (
    <Provider store={store}>
      <Main />
    </Provider>
  )
}
