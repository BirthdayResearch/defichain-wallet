import React, { PropsWithChildren, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Logging } from '../api'
import { useWallet, WalletProvider } from '../contexts/WalletContext'
import { useWalletPersistenceContext } from '../contexts/WalletPersistenceContext'
import { wallet as store } from '../store/wallet'
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

/**
 * TODO(fuxingloh): to deprecate completely
 * @deprecated included for legacy reasons, moving forward address should not be set in store
 */
function WalletAddressProvider (props: PropsWithChildren<any>): JSX.Element | null {
  const wallet = useWallet()
  const dispatch = useDispatch()
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    wallet.get(0).getAddress().then(address => {
      dispatch(store.actions.setAddress(address))
      setLoaded(true)
    }).catch(Logging.error)
  }, [wallet])

  if (!isLoaded) {
    return null
  }

  return props.children
}
