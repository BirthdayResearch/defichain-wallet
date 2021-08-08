import React, { PropsWithChildren, useMemo } from 'react'
import { Provider as StoreProvider } from 'react-redux'
import { createStore } from '../store'
import { useNetworkContext } from './NetworkContext'
import { useWalletPersistenceContext } from './WalletPersistenceContext'

/**
 * Store that is memoized to network & wallets setting.
 */
export function WalletStoreProvider (props: PropsWithChildren<any>): JSX.Element {
  const { network } = useNetworkContext()
  const { wallets } = useWalletPersistenceContext()

  const store = useMemo(() => {
    return createStore()
  }, [network, wallets])

  return (
    <StoreProvider store={store}>
      {props.children}
    </StoreProvider>
  )
}
