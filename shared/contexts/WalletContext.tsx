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
  /**
   * Available address length of the above wallet
   */
  addressLength: number
  /**
   * Switch account addresses of the above wallet
   */
  setIndex: (index: number) => Promise<void>
  /**
   * Create new account addresses of the above wallet
   */
  append: () => Promise<void>

}

export interface WalletContextProviderProps extends PropsWithChildren<{}> {
  api: {
    getLength: () => Promise<number>
    setLength: (count: number) => Promise<void>
    getActive: () => Promise<number>
    setActive: (count: number) => Promise<void>
  }
}

const WalletContext = createContext<WalletContextI>(undefined as any)

export function useWalletContext (): WalletContextI {
  return useContext(WalletContext)
}

export function WalletContextProvider (props: WalletContextProviderProps): JSX.Element | null {
  const { api } = props
  const logger = useLogger()
  const { provider } = useWalletNodeContext()
  const [address, setAddress] = useState<string>()
  const [account, setAccount] = useState<WhaleWalletAccount>()
  const [addressLength, setAddressLength] = useState<number>(0)
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()

  const wallet = useMemo(() => {
    return initJellyfishWallet(provider, network, client)
  }, [provider, network, client])

  useEffect(() => {
    getWalletDetails()
    .catch(logger.error)
  }, [wallet])

  const getWalletDetails = async (): Promise<void> => {
    const maxAddressIndex = await api.getLength()
    setAddressLength(maxAddressIndex)
    const activeAddressIndex = await api.getActive()
    const account = wallet.get(activeAddressIndex)
    const address = await account.getAddress()
    setAccount(account)
    setAddress(address)
  }

  const append = async (): Promise<void> => {
    const index = addressLength + 1
    await api.setLength(index)
    setAddressLength(index)
  }

  const setIndex = async (index: number): Promise<void> => {
    const account = wallet.get(index)
    const address = await account.getAddress()
    await api.setActive(index)
    setAccount(account)
    setAddress(address)
  }

  if (account === undefined || address === undefined) {
    return null
  }

  const context: WalletContextI = {
    wallet: wallet,
    account: account,
    address: address,
    setIndex: setIndex,
    append: append,
    addressLength: addressLength
  }

  return (
    <WalletContext.Provider value={context}>
      {props.children}
    </WalletContext.Provider>
  )
}
