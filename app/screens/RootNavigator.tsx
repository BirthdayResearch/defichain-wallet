import React from 'react'
import { WalletAddressProvider } from '../contexts/WalletAddressContext'
import { WalletProvider } from '../contexts/WalletContext'
import { useWalletPersistenceContext } from '../contexts/WalletPersistenceContext'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const { wallets } = useWalletPersistenceContext()

  if (wallets.length === 0) {
    return <WalletNavigator />
  }

  return (
    <WalletProvider data={wallets[0]}>
      <WalletAddressProvider>
        <AppNavigator />
      </WalletAddressProvider>
    </WalletProvider>
  )
}
