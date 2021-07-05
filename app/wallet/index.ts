import { JellyfishWallet, WalletHdNode } from '@defichain/jellyfish-wallet'
import { WhaleWalletAccount, WhaleWalletAccountProvider } from '@defichain/whale-api-wallet'
import { useEffect, useState } from 'react'
import { Logging } from '../logging'
import { getMnemonicHdNodeProvider } from './mnemonic'
import { WalletData, WalletPersistence, WalletType } from './persistence'
import { getWhaleWalletAccountProvider } from './whale'

type Wallet = JellyfishWallet<WhaleWalletAccount, WalletHdNode>
let INSTANCE: Wallet[]

export function useCachedWallets (): boolean {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    initWallets().then(() => {
      setLoaded(true)
    }).catch(Logging.error)
  }, [])

  return isLoaded
}

async function initWallets (): Promise<void> {
  const items: Wallet[] = []

  const accountProvider = await getWhaleWalletAccountProvider()
  for (const item of await WalletPersistence.get()) {
    items.push(await newWallet(item, accountProvider))
  }

  INSTANCE = items
}

async function newWallet (data: WalletData, accountProvider: WhaleWalletAccountProvider): Promise<Wallet> {
  switch (data.type) {
    case WalletType.MNEMONIC_UNPROTECTED:
      return new JellyfishWallet(await getMnemonicHdNodeProvider(data), accountProvider)

    default:
      throw new Error(`wallet ${data.type as string} not available`)
  }
}

/**
 * @return {JellyfishWallet<WhaleWalletAccount, WalletHdNode>[]}
 * @see useCachedWallets to load wallet first
 */
export function getWallets (): Wallet[] {
  if (INSTANCE !== undefined) {
    return INSTANCE
  }

  throw new Error('useCachedWallets() === true, hooks must be called before get...()')
}

/**
 * @param {number} index of wallet to retrieve
 * @return {JellyfishWallet<WhaleWalletAccount, WalletHdNode>}
 * @see useCachedWallets to load wallet first
 */
export function getWallet (index: number): Wallet {
  return getWallets()[index]
}

/**
 * @param {number} index of wallet to check if exist
 */
export function hasWallet (index: number): boolean {
  return getWallet(index) !== undefined
}
