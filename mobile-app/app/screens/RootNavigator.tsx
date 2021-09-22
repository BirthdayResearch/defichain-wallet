import React, { useEffect } from 'react'
import { WalletContextProvider } from '@contexts/WalletContext'
import { WalletNodeProvider } from '@contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@contexts/WalletPersistenceContext'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { PrivacyLock } from './PrivacyLock'
import { TransactionAuthorization } from './TransactionAuthorization/TransactionAuthorization'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'
import { WalletNotifications } from '@api/wallet/notifications'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const {
    wallets,
    isLoaded
  } = useWalletPersistenceContext()

  useEffect(() => {
    void WalletNotifications.register()
  }, [])

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
