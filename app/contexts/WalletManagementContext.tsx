import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Logging } from '../api/logging'
import { WalletPersistence, WalletPersistenceData } from '../api/wallet/persistence'
import { initWhaleWallet, WhaleWallet } from '../api/wallet/provider'
import { useNetworkContext } from './NetworkContext'
import { useWhaleApiClient } from './WhaleContext'

interface WalletManagement {
  wallets: WhaleWallet[]
  /**
   * @param {WalletPersistenceData} data to set, only 1 wallet is supported for now
   */
  setWallet: (data: WalletPersistenceData<any>) => Promise<void>
  clearWallets: () => Promise<void>
}

const WalletManagementContext = createContext<WalletManagement>(undefined as any)

/**
 * WalletManagement Context wrapped within <WalletManagementProvider>
 *
 * This context enable wallet management by allow access to all configured wallets.
 * Setting, removing and getting individual wallet.
 */
export function useWalletManagementContext (): WalletManagement {
  return useContext(WalletManagementContext)
}

export function WalletManagementProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()
  const [dataList, setDataList] = useState<Array<WalletPersistenceData<any>>>([])

  useEffect(() => {
    WalletPersistence.get().then(dataList => {
      setDataList(dataList)
    }).catch(Logging.error)
  }, [network])

  const wallets = useMemo(() => {
    return dataList.map(data => initWhaleWallet(data, network, client))
  }, [dataList])

  const management: WalletManagement = {
    wallets: wallets,
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
    <WalletManagementContext.Provider value={management}>
      {props.children}
    </WalletManagementContext.Provider>
  )
}
