import React, { createContext, useContext, useEffect, useState } from 'react'
import { Logging, WalletPersistence, WalletPersistenceData } from '../api'
import { useNetworkContext } from './NetworkContext'

interface WalletPersistenceContextI {
  wallets: WalletPersistenceData<any>[]
  /**
   * @param {WalletPersistenceData} data to set, only 1 wallet is supported for now
   */
  setWallet: (data: WalletPersistenceData<any>) => Promise<void>
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

export function WalletPersistenceProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()
  const [list, setList] = useState<Array<WalletPersistenceData<any>>>([])

  useEffect(() => {
    WalletPersistence.get().then(dataList => {
      setList(dataList)
    }).catch(Logging.error)
  }, [network])

  const management: WalletPersistenceContextI = {
    wallets: list,
    async setWallet (data: WalletPersistenceData<any>): Promise<void> {
      await WalletPersistence.set([data])
      setList(await WalletPersistence.get())
    },
    async clearWallets (): Promise<void> {
      await WalletPersistence.set([])
      setList(await WalletPersistence.get())
    }
  }

  return (
    <WalletPersistenceContext.Provider value={management}>
      {props.children}
    </WalletPersistenceContext.Provider>
  )
}
