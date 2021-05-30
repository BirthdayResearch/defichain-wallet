import { JellyfishWallet, WalletAccount, WalletHdNode } from '@defichain/jellyfish-wallet'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { NetworkName } from '../../store/network'
import { useWhaleApiClient } from '../api/useWhaleApiClient'
import { useEffect, useState } from 'react'
import { getMnemonicWallet, hasMnemonicWallet } from './MnemonicWallet'

let wallet: JellyfishWallet<WalletAccount, WalletHdNode>

export enum WalletStatus {
  NONE,
  LOADING,
  LOADED,
  ERROR
}

/**
 * Use a loaded Jellyfish Wallet.
 * Attempting to useJellyfishWallet without having it loaded with end exceptionally.
 */
export function useJellyfishWallet (): JellyfishWallet<WalletAccount, WalletHdNode> {
  if (wallet === undefined) {
    throw new Error('useLoadJellyfishWallet() === WalletStatus.LOADED, hooks must be called first')
  }
  return wallet
}

export async function useLoadJellyfishWallet (): Promise<WalletStatus> {
  const name = useSelector<RootState, NetworkName | undefined>(state => state.network.name)
  const client = useWhaleApiClient()
  if (name === undefined) {
    throw new Error('useNetwork() === true, hooks must be called before useJellyfishWallet()')
  }

  const [status, setStatus] = useState(WalletStatus.LOADING)

  useEffect(() => {
    async function loadWallet (): Promise<void> {
      if (await hasMnemonicWallet()) {
        wallet = await getMnemonicWallet(client, name as NetworkName)
        setStatus(WalletStatus.LOADED)
      } else {
        setStatus(WalletStatus.NONE)
      }
    }

    loadWallet().catch(() => {
      setStatus(WalletStatus.ERROR)
    })
  })

  return status
}
