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
   * Available addresses of the above wallet
   */
  availableAddresses: string[]
  /**
   * Switch account addresses of the above wallet
   */
  switchAccount: (index: number) => Promise<void>
  /**
   * Create new account addresses of the above wallet
   */
  createAddress: () => Promise<void>

}
export interface WalletContextProviderProps extends PropsWithChildren<{}> {
  api: {
    get: (type: string) => Promise<number>
    set: (type: string, count: number) => Promise<void>
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
  const [availableAddresses, setAvailableAddresses] = useState<string[]>([])
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
    const maxAddressIndex = 2 // await api.get('max')
    const activeAddressIndex = await api.get('active')
    const addresses: string[] = []
    for (let i = 0; i <= maxAddressIndex; i++) {
      const account = wallet.get(i)
      const address = await account.getAddress()
      addresses.push(address)
      if (i === activeAddressIndex) {
        setAccount(account)
        setAddress(address)
      }
    }
    setAvailableAddresses(addresses)
  }

  const createAddress = async (): Promise<void> => {
    const index = availableAddresses.length
    await api.set('max', index)
    const account = wallet.get(index)
    const address = await account.getAddress()
    setAvailableAddresses([...availableAddresses, address])
  }

  const switchAccount = async (index: number): Promise<void> => {
    const account = wallet.get(index)
    const address = await account.getAddress()
    await api.set('active', index)
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
    switchAccount: switchAccount,
    createAddress: createAddress,
    availableAddresses: availableAddresses
  }

  return (
    <WalletContext.Provider value={context}>
      {props.children}
    </WalletContext.Provider>
  )
}
