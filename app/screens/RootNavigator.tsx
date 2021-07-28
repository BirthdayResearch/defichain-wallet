import React from 'react'
import { WalletProvider } from '../contexts/WalletContext'
import { useWalletManagementContext } from '../contexts/WalletManagementContext'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'
import { EncryptedWallet } from './EncryptedWallet'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const { wallets } = useWalletManagementContext()

  if (wallets.length === 0) {
    return <WalletNavigator />
  }

  return (
    <WalletProvider>
      <EncryptedWallet />
      <AppNavigator />
    </WalletProvider>
  )
}
