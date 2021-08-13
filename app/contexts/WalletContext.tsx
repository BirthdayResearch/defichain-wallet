import { JellyfishWallet, WalletHdNode, WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MnemonicProviderData } from '@defichain/jellyfish-wallet-mnemonic'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { Logging } from '../api'
import {
  initJellyfishWallet,
  MnemonicEncrypted,
  MnemonicUnprotected,
  WalletPersistenceData,
  WalletType
} from '../api/wallet'
import { useNetworkContext } from './NetworkContext'
import { useWhaleApiClient } from './WhaleContext'

interface EncryptedWalletInterface {
  // provider demand passcode/biometric UI
  prompt: () => Promise<string>
}

interface EncryptedWalletUIContext {
  provide: (ewi: EncryptedWalletInterface) => void
}

interface WalletContextI {
  /**
   * The entire HD Wallet, powered by @defichain/jellyfish-wallet
   */
  wallet: JellyfishWallet<WhaleWalletAccount, WalletHdNode>
  /**
   * Default account of the above wallet
   */
  account: WhaleWalletAccount
  /**
   * Default address of the above wallet
   */
  address: string
}

const WalletContext = createContext<WalletContextI>(undefined as any)
const EncryptedWalletContext = createContext<EncryptedWalletUIContext>(undefined as any)

export function useWalletContext (): WalletContextI {
  return useContext(WalletContext)
}

export function useEncryptedWalletUI (): EncryptedWalletUIContext {
  return useContext(EncryptedWalletContext)
}

interface WalletProviderProps<T> extends PropsWithChildren<any> {
  data: WalletPersistenceData<T>
}

/**
 * Automatically determine the correct WalletProvider to use based on the wallet type.
 */
export function WalletProvider (props: WalletProviderProps<any>): JSX.Element | null {
  if (props.data.type === WalletType.MNEMONIC_UNPROTECTED) {
    return (
      <MnemonicUnprotectedProvider {...props}>
        {props.children}
      </MnemonicUnprotectedProvider>
    )
  }

  if (props.data.type === WalletType.MNEMONIC_ENCRYPTED) {
    return (
      <MnemonicEncryptedProvider {...props}>
        {props.children}
      </MnemonicEncryptedProvider>
    )
  }

  throw new Error(`wallet type: ${props.data.type as string} not available`)
}

function MnemonicUnprotectedProvider (props: WalletProviderProps<MnemonicProviderData>): JSX.Element | null {
  const { network } = useNetworkContext()

  const provider = useMemo(() => {
    return MnemonicUnprotected.initProvider(props.data, network)
  }, [network, props.data])

  return (
    <WalletContextProvider provider={provider}>
      {props.children}
    </WalletContextProvider>
  )
}

function MnemonicEncryptedProvider (props: WalletProviderProps<EncryptedProviderData>): JSX.Element | null {
  const { network } = useNetworkContext()
  const [promptUI, setPromptUI] = useState<EncryptedWalletInterface>({
    async prompt () {
      throw new Error('Prompt UI not ready')
    }
  })

  const provider = useMemo(() => {
    return MnemonicEncrypted.initProvider(props.data, network, promptUI)
  }, [network, promptUI, props.data])

  const encryptedWalletInterface: EncryptedWalletUIContext = {
    provide: (ewi: EncryptedWalletInterface) => {
      setPromptUI(ewi)
    }
  }

  return (
    <WalletContextProvider provider={provider}>
      <EncryptedWalletContext.Provider value={encryptedWalletInterface}>
        {props.children}
      </EncryptedWalletContext.Provider>
    </WalletContextProvider>
  )
}

function WalletContextProvider (props: PropsWithChildren<{ provider: WalletHdNodeProvider<WalletHdNode> }>): JSX.Element | null {
  const [address, setAddress] = useState<string>()
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()

  const wallet = useMemo(() => {
    return initJellyfishWallet(props.provider, network, client)
  }, [props.provider, network, client])

  useEffect(() => {
    wallet.get(0).getAddress().then(value => {
      setAddress(value)
    }).catch(Logging.error)
  }, [wallet])

  if (address === undefined) {
    return null
  }

  const context: WalletContextI = {
    wallet: wallet,
    account: wallet.get(0),
    address: address
  }

  return (
    <WalletContext.Provider value={context}>
      {props.children}
    </WalletContext.Provider>
  )
}
