import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Logging } from '../api/logging'
import { PasscodeAttemptCounter } from '../api/wallet/passcode_attempt_counter'
import { WalletPersistence, WalletPersistenceData } from '../api/wallet/persistence'
import { initWhaleWallet, WhaleWallet } from '../api/wallet/provider'
import { PromptInterface } from '../api/wallet/provider/mnemonic_encrypted'
import { useNetworkContext } from './NetworkContext'
import { useWhaleApiClient } from './WhaleContext'

export const MAX_PASSCODE_ATTEMPT = 3
export const PASSCODE_LENGTH = 6

interface WalletManagement {
  wallets: WhaleWallet[]
  /**
   * @param {WalletPersistenceData} data to set, only 1 wallet is supported for now
   */
  setWallet: (data: WalletPersistenceData<any>) => Promise<void>
  clearWallets: () => Promise<void>

  // logic to bridge promptPassphrase UI and jellyfish-txn-builder
  setPasscodePromptInterface: (constructPrompt: PromptInterface) => void
  incrementPasscodeErrorCount: () => Promise<void>
  errorCount: () => Promise<number>
  resetErrorCount: () => Promise<void>
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

  const [promptInterface, setPromptInterface] = useState<PromptInterface>()

  useEffect(() => {
    WalletPersistence.get().then(dataList => {
      setDataList(dataList)
    }).catch(Logging.error)
  }, [network])

  const wallets = useMemo(() => {
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
    },
    async incrementPasscodeErrorCount (): Promise<void> {
      const failed = await PasscodeAttemptCounter.get()
      if (failed + 1 > MAX_PASSCODE_ATTEMPT) return await this.clearWallets()
      return await PasscodeAttemptCounter.set(failed + 1)
    },
    errorCount: PasscodeAttemptCounter.get,
    async resetErrorCount (): Promise<void> {
      return await PasscodeAttemptCounter.set(0)
    }
  }

  return (
    <WalletManagementContext.Provider value={management}>
      {props.children}
    </WalletManagementContext.Provider>
  )
}
