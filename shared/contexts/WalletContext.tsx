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
   * Index of active address
   */
  activeAddressIndex: number | undefined
  /**
   * Switch account addresses of the above wallet
   */
  setIndex: (index: number) => Promise<void>
  /**
   * Discover Wallet Addresses of the above wallet
   */
   discoverWalletAddresses: () => Promise<void>
}

export interface WalletContextProviderProps extends PropsWithChildren<{}> {
  api: {
    getLength: () => Promise<number>
    setLength: (count: number) => Promise<void>
    getActive: () => Promise<number>
    setActive: (count: number) => Promise<void>
  }
}

export const MAX_ALLOWED_ADDRESSES = 10

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
  const [addressIndex, setAddressIndex] = useState<number>()
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

  useEffect(() => {
    if (addressIndex !== undefined) {
      const account = wallet.get(addressIndex)
      account.getAddress().then((address) => {
        setAccount(account)
        setAddress(address)
      }).catch(logger.error)
    }
  }, [wallet, addressIndex])

  const getWalletDetails = async (): Promise<void> => {
    const maxAddressIndex = await api.getLength()
    const activeAddressIndex = await api.getActive()
    setAddressIndex(activeAddressIndex)
    setAddressLength(maxAddressIndex)
  }

  const setIndex = async (index: number): Promise<void> => {
    if (index === addressIndex) {
      return
    }

    if (index > addressLength) {
      await setWalletAddressLength(index)
    }
    await api.setActive(index)
    setAddressIndex(index)
  }

  const setWalletAddressLength = async (index: number): Promise<void> => {
    await api.setLength(index)
    setAddressLength(index)
  }

  const discoverWalletAddresses = async (): Promise<void> => {
    // get discovered address
    const activeAddress = await wallet.discover(MAX_ALLOWED_ADDRESSES)
    // sub 1 from total discovered address to get address index of last active address
    const lastDiscoveredAddressIndex = Math.max(0, activeAddress.length - 1, addressLength)
    await setWalletAddressLength(lastDiscoveredAddressIndex)
  }

  if (account === undefined || address === undefined) {
    return null
  }

  const context: WalletContextI = {
    wallet: wallet,
    account: account,
    address: address,
    activeAddressIndex: addressIndex,
    setIndex: setIndex,
    addressLength: addressLength,
    discoverWalletAddresses: discoverWalletAddresses
  }

  return (
    <WalletContext.Provider value={context}>
      {props.children}
    </WalletContext.Provider>
  )
}
