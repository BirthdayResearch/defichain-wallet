import React from 'react'
import { WalletContextProvider } from '../contexts/WalletContext'
import { WalletNodeProvider } from '../contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '../contexts/WalletPersistenceContext'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { TransactionAuthorization } from './TransactionAuthorization'
import { PrivacyLock } from './PrivacyLock'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const { wallets, isLoaded } = useWalletPersistenceContext()

  // To prevent flicker on start of app, while API is not yet called
  if (!isLoaded) {
    return <></>
  }

  if (wallets.length === 0) {
    return <WalletNavigator />
  }

  return (
    <WalletNodeProvider data={wallets[0]}>
      <WalletContextProvider>
        <PrivacyLock />
        <TransactionAuthorization />
        <AppNavigator />
      </WalletContextProvider>
    </WalletNodeProvider>
  )
}
