import React from 'react'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'
import { useWalletAPI } from '../hooks/wallet/WalletAPI'
import { WalletStatus } from '../store/wallet'
import { WalletSetupNavigator } from './WalletSetupNavigator/WalletSetupNavigator'

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const WalletAPI = useWalletAPI()
  const status = WalletAPI.getStatus()

  switch (status) {
    case WalletStatus.ERROR:
    case WalletStatus.INITIAL:
    case WalletStatus.LOADING:
      return <></>
    case WalletStatus.LOADED_WALLET:
      return <WalletNavigator />
    case WalletStatus.NO_WALLET:
      return <WalletSetupNavigator />
  }
}
