import { JellyfishWallet, WalletHdNode } from '@defichain/jellyfish-wallet'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { useEffect, useState } from 'react'
import { Logging } from '../logging'
import { getMnemonicHdNodeProvider } from './mnemonic'
import { getWhaleWalletAccountProvider } from './whale'

type Wallet = JellyfishWallet<WhaleWalletAccount, WalletHdNode>
let INSTANCE: Wallet

export function useCachedWallet (): boolean {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    newWallet().then((client) => {
      INSTANCE = client
      setLoaded(true)
    }).catch(Logging.error)
  }, [])

  return isLoaded
}

async function newWallet (): Promise<Wallet> {
  const nodeProvider = await getMnemonicHdNodeProvider()
  const accountProvider = await getWhaleWalletAccountProvider()
  return new JellyfishWallet(nodeProvider, accountProvider)
}

/**
 * @return WhaleWalletAccount the default index 0 account
 * @see useCachedWallet to load wallet first
 */
export function getAccount (): WhaleWalletAccount {
  return getWallet().get(0)
}

/**
 * @return {JellyfishWallet<WhaleWalletAccount, WalletHdNode>}
 * @see useCachedWallet to load wallet first
 */
export function getWallet (): Wallet {
  if (INSTANCE !== undefined) {
    return INSTANCE
  }

  throw new Error('useCachedWallet() === true, hooks must be called before getWallet()')
}
