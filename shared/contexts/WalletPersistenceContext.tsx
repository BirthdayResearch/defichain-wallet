import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react'
import { useNetworkContext } from './NetworkContext'

export enum WalletType {
  MNEMONIC_UNPROTECTED = 'MNEMONIC_UNPROTECTED',
  MNEMONIC_ENCRYPTED = 'MNEMONIC_ENCRYPTED'
}

export interface WalletPersistenceDataI<T> {
  type: WalletType
  /* To migrate between app version upgrade */
  version: 'v1'
  /* Raw Data encoded in WalletType specified format */
  raw: T
}

interface WalletPersistenceContextI {
  isLoaded: boolean
  wallets: Array<WalletPersistenceDataI<any>>
  /**
   * @param {WalletPersistenceDataI} data to set, only 1 wallet is supported for now
   */
  setWallet: (data: WalletPersistenceDataI<any>) => Promise<void>
  clearWallets: () => Promise<void>
}

const WalletPersistenceContext = createContext<WalletPersistenceContextI>(undefined as any)

/**
 * WalletManagement Context wrapped within <WalletPersistenceProvider>
 *
 * This context enable wallet management by allow access to all configured wallets.
 * Setting, removing and getting individual wallet.
 */
export function useWalletPersistenceContext (): WalletPersistenceContextI {
  return useContext(WalletPersistenceContext)
}

interface WalletPersistenceProviderI {
  api: {
    get: () => Promise<Array<WalletPersistenceDataI<any>>>
    set: (wallets: Array<WalletPersistenceDataI<any>>) => Promise<void>
    setLength: (count: number) => Promise<void>
    setActive: (count: number) => Promise<void>
  }
}

export function WalletPersistenceProvider (props: WalletPersistenceProviderI & PropsWithChildren<any>): JSX.Element | null {
  const { api } = props
  const logger = useLogger()
  const { network } = useNetworkContext()
  const [isLoaded, setIsLoaded] = useState(false)
  const [dataList, setDataList] = useState<Array<WalletPersistenceDataI<any>>>([])

  useEffect(() => {
    api.get().then((dataList: Array<WalletPersistenceDataI<any>>) => {
      setDataList(dataList)
    })
    .catch(logger.error)
    .finally(() => setIsLoaded(true))
  }, [network]) // api is network dependent

  const management: WalletPersistenceContextI = {
    isLoaded,
    wallets: dataList,
    async setWallet (data: WalletPersistenceDataI<any>): Promise<void> {
      await api.set([data])
      setDataList(await api.get())
    },
    async clearWallets (): Promise<void> {
      // remove address length and active address
      await api.setLength(0)
      await api.setActive(0)
      await api.set([])
      setDataList(await api.get())
    }
  }

  return (
    <WalletPersistenceContext.Provider value={management}>
      {props.children}
    </WalletPersistenceContext.Provider>
  )
}
