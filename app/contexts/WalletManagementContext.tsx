import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Logging } from '../api/logging'
import { WalletPersistence, WalletPersistenceData } from '../api/wallet/persistence'
import { initWhaleWallet, WhaleWallet } from '../api/wallet/provider'
import { PromptInterface } from '../api/wallet/provider/mnemonic_encrypted'
import { useNetworkContext } from './NetworkContext'
import { useWhaleApiClient } from './WhaleContext'

interface WalletManagement {
  wallets: WhaleWallet[]
  setWallet: (data: WalletPersistenceData<any>) => Promise<void>
  clearWallets: () => Promise<void>
  setPasscodePromptInterface: (constructPrompt: PromptInterface) => void
}

const WalletManagementContext = createContext<WalletManagement>(undefined as any)

export function useWalletManagementContext (): WalletManagement {
  return useContext(WalletManagementContext)
}

export function WalletManagementProvider (props: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()
  const [dataList, setDataList] = useState<Array<WalletPersistenceData<any>>>([])
  const [promptInterface, setPromptInterface] = useState<PromptInterface>()

  useEffect(() => {
    WalletPersistence.get().then(dataList => {
      setDataList(dataList)
    }).catch(Logging.error)
  }, [network])

  const wallets = useMemo(() => {
    console.log('use wallet memo, prompt constructor', promptInterface)
    if (promptInterface !== undefined) console.log('prompt constructor set')
    return dataList.map(data => initWhaleWallet(data, network, client, promptInterface))
  }, [dataList, promptInterface])

  const management: WalletManagement = {
    wallets: wallets,
    async setWallet (data: WalletPersistenceData<any>): Promise<void> {
      await WalletPersistence.set([data])
      setDataList(await WalletPersistence.get())
    },
    async clearWallets (): Promise<void> {
      await WalletPersistence.set([])
      setDataList(await WalletPersistence.get())
    },
    setPasscodePromptInterface (cb: PromptInterface): void {
      setPromptInterface(cb)
    }
  }

  return (
    <WalletManagementContext.Provider value={management}>
      {props.children}
    </WalletManagementContext.Provider>
  )
}
