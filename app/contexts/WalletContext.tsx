import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Logging } from '../api/logging'
import { Wallet } from '../api/wallet'
import { wallet as store } from '../store/wallet'
import { useWalletManagementContext } from './WalletManagementContext'

const WalletContext = createContext<Wallet>(undefined as any)

export function useWallet (): Wallet {
  return useContext(WalletContext)
}

export function WalletProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const dispatch = useDispatch()
  const management = useWalletManagementContext()
  const wallet = management.wallets[0]

  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    wallet.get(0).getAddress().then(address => {
      dispatch(store.actions.setAddress(address))
      setLoaded(true)
    }).catch(Logging.error)
  }, [management.wallets])

  if (!isLoaded) {
    return null
  }

  return (
    <WalletContext.Provider value={wallet}>
      {props.children}
    </WalletContext.Provider>
  )
}
