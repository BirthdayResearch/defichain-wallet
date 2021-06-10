import * as React from 'react'
import { useWalletAPI } from '../hooks/wallet/WalletAPI'
import { WalletStatus } from '../store/wallet'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'
// import { LoadingNavigator } from "./LoadingNavigator/LoadingNavigator";

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
      return <AppNavigator />
    case WalletStatus.NO_WALLET:
      return <WalletNavigator />
  }
}
