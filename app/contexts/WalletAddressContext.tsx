import React, { createContext, useContext, useEffect, useState } from 'react'
import { Logging } from '../api'
import { useWallet } from './WalletContext'

interface WalletAddress {
  address: string
}

const WalletAddressContext = createContext<WalletAddress>(undefined as any)

export function useWalletAddressContext (): WalletAddress {
  return useContext(WalletAddressContext)
}

export function WalletAddressProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const wallet = useWallet()
  const [address, setAddress] = useState<string>()

  useEffect(() => {
    wallet.get(0).getAddress().then(value => {
      setAddress(value)
    }).catch(Logging.error)
  }, [])

  if (address === undefined) {
    return null
  }

  const context: WalletAddress = {
    address
  }

  return (
    <WalletAddressContext.Provider value={context}>
      {props.children}
    </WalletAddressContext.Provider>
  )
}
