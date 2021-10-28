import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { JellyfishWallet, WalletHdNode } from '@defichain/jellyfish-wallet'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { useNetworkContext } from './NetworkContext'
import { useWhaleApiClient } from './WhaleContext'
import { useWalletNodeContext } from './WalletNodeProvider'
import { initJellyfishWallet } from '@api/wallet'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'

interface WalletContextI {
  /**
   * The entire HD Wallet, powered by @defichain/jellyfish-wallet
   */
  wallet: JellyfishWallet<WhaleWalletAccount, WalletHdNode>
  /**
   * Default account of the above wallet
   */
  account: WhaleWalletAccount
  /**
   * Default address of the above wallet
   */
  address: string
}

const WalletContext = createContext<WalletContextI>(undefined as any)

export function useWalletContext (): WalletContextI {
  return useContext(WalletContext)
}

export function WalletContextProvider (props: PropsWithChildren<any>): JSX.Element | null {
  const logger = useLogger()
  const { provider } = useWalletNodeContext()
  const [address, setAddress] = useState<string>()
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()

  const wallet = useMemo(() => {
    return initJellyfishWallet(provider, network, client)
  }, [provider, network, client])

  useEffect(() => {
    wallet.get(0).getAddress().then(value => {
      setAddress(value)
    })
    .catch(logger.error)
  }, [wallet])

  if (address === undefined) {
    return null
  }

  const context: WalletContextI = {
    wallet: wallet,
    account: wallet.get(0),
    address: address
  }

  return (
    <WalletContext.Provider value={context}>
      {props.children}
    </WalletContext.Provider>
  )
}
