import { WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Logging } from '../api/logging'
import { createWallet, Wallet } from '../api/wallet'
import { getJellyfishNetwork } from '../api/wallet/network'
import { WalletData, WalletPersistence } from '../api/wallet/persistence'
import { useNetworkContext } from './NetworkContext'
import { useWhaleApiClient } from './WhaleContext'

interface WalletManagement {
  wallets: Wallet[]
  setWallet: (data: WalletData) => Promise<void>
  clearWallets: () => Promise<void>
}

const WalletManagementContext = createContext<WalletManagement>(undefined as any)

export function useWalletManagementContext (): WalletManagement {
  return useContext(WalletManagementContext)
}

export function WalletManagementProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()
  const [dataList, setDataList] = useState<WalletData[]>([])

  useEffect(() => {
    WalletPersistence.get().then(dataList => {
      setDataList(dataList)
    }).catch(Logging.error)
  }, [])

  const wallets = useMemo(() => {
    const options = getJellyfishNetwork(network)
    const provider = new WhaleWalletAccountProvider(client, options)
    return dataList.map(data => createWallet(data, options, provider))
  }, [dataList])

  const management: WalletManagement = {
    wallets: wallets,
    async setWallet (data: WalletData): Promise<void> {
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
