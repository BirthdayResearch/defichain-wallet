import React, { useMemo } from 'react'
import { Provider as StoreProvider } from 'react-redux'
import { WalletAddressProvider } from '../contexts/WalletAddressContext'
import { WalletProvider } from '../contexts/WalletContext'
import { useWalletPersistenceContext } from '../contexts/WalletPersistenceContext'
import { createStore } from '../store'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { TransactionAuthorization } from './TransactionAuthorization'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const { wallets } = useWalletPersistenceContext()
  const store = useMemo(() => createStore(), [wallets[0]])

  if (wallets.length === 0) {
    return <WalletNavigator />
  }

  return (
    <WalletProvider data={wallets[0]}>
      <StoreProvider store={store}>
        <WalletAddressProvider>
          <TransactionAuthorization />
          <AppNavigator />
        </WalletAddressProvider>
      </StoreProvider>
    </WalletProvider>
  )
}
