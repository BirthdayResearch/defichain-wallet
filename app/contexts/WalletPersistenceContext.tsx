import React, { createContext, useContext, useEffect, useState } from 'react'
import { Logging } from '../api'
import { WalletPersistence, WalletPersistenceData } from '../api/wallet'
import { useNetworkContext } from './NetworkContext'

interface WalletPersistenceContextI {
  wallets: Array<WalletPersistenceData<any>>
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
  const [dataList, setDataList] = useState<Array<WalletPersistenceData<any>>>([])

  useEffect(() => {
    WalletPersistence.get().then(dataList => {
      setDataList(dataList)
    }).catch(Logging.error)
  }, [network]) // WalletPersistence is network dependent

  const management: WalletPersistenceContextI = {
    wallets: dataList,
    async setWallet (data: WalletPersistenceData<any>): Promise<void> {
      await WalletPersistence.set([data])
      setDataList(await WalletPersistence.get())
    },
    async clearWallets (): Promise<void> {
      await WalletPersistence.set([])
      setDataList(await WalletPersistence.get())
    }
  }

  return (
    <WalletPersistenceContext.Provider value={management}>
      {props.children}
    </WalletPersistenceContext.Provider>
  )
}
