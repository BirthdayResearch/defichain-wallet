import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MnemonicProviderData } from '@defichain/jellyfish-wallet-mnemonic'
import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react'

import {
  initWhaleWallet,
  MnemonicEncrypted,
  MnemonicUnprotected,
  WalletPersistenceData,
  WalletType,
  WhaleWallet
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

const WalletContext = createContext<WhaleWallet>(undefined as any)
const EncryptedWalletContext = createContext<EncryptedWalletUIContext>(undefined as any)

export function useWallet (): WhaleWallet {
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
  const client = useWhaleApiClient()

  const wallet = useMemo(() => {
    const provider = MnemonicUnprotected.initProvider(props.data, network)
    return initWhaleWallet(provider, network, client)
  }, [network, client, props.data])

  return (
    <WalletContext.Provider value={wallet}>
      {props.children}
    </WalletContext.Provider>
  )
}

function MnemonicEncryptedProvider (props: WalletProviderProps<EncryptedProviderData>): JSX.Element | null {
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()
  const [promptUI, setPromptUI] = useState<EncryptedWalletInterface>({
    prompt: async () => {
      throw new Error('Prompt UI not ready')
    }
  })

  const wallet = useMemo(() => {
    const provider = MnemonicEncrypted.initProvider(props.data, network, promptUI)
    return initWhaleWallet(provider, network, client)
  }, [network, client, promptUI, props.data])

  const encryptedWalletInterface: EncryptedWalletUIContext = {
    provide: (ewi: EncryptedWalletInterface) => {
      setPromptUI(ewi)
    }
  }

  return (
    <WalletContext.Provider value={wallet}>
      <EncryptedWalletContext.Provider value={encryptedWalletInterface}>
        {props.children}
      </EncryptedWalletContext.Provider>
    </WalletContext.Provider>
  )
}
