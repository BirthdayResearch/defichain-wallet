import React, { PropsWithChildren, useMemo } from 'react'
import { Provider as StoreProvider } from 'react-redux'
import { initializeStore } from '../store'
import { useWalletPersistenceContext } from './WalletPersistenceContext'

/**
 * Store that is memoized to network & wallets setting.
 */
export function WalletStoreProvider (props: PropsWithChildren<any>): JSX.Element {
  const { wallets } = useWalletPersistenceContext()

  const store = useMemo(() => {
    return initializeStore()
  }, [wallets])

  return (
    <StoreProvider store={store}>
      {props.children}
    </StoreProvider>
  )
}
