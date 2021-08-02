import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MnemonicProviderData } from '@defichain/jellyfish-wallet-mnemonic'
import React, { createContext, MutableRefObject, PropsWithChildren, useCallback, useContext, useMemo, useRef } from 'react'
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
  // consumer provide interface
  provide: (onPrompt: () => void) => void

  // provider demand passcode/biometric UI
  prompt?: () => void

  // consumer return result
  resolve: (passphrase: string) => void
  reject: (error: Error) => void
}

const WalletContext = createContext<WhaleWallet>(undefined as any)
const EncryptedWalletContext = createContext<MutableRefObject<EncryptedWalletInterface>>(undefined as any)

export function useWallet (): WhaleWallet {
  return useContext(WalletContext)
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
  }, [])

  return (
    <WalletContext.Provider value={wallet}>
      {props.children}
    </WalletContext.Provider>
  )
}

function MnemonicEncryptedProvider (props: WalletProviderProps<EncryptedProviderData>): JSX.Element | null {
  const { network } = useNetworkContext()
  const client = useWhaleApiClient()
  const signingRef = useRef<EncryptedWalletInterface>({
    provide: (prompt) => { signingRef.current.prompt = prompt },
    resolve: () => {},
    reject: () => {}
  })

  const promptPassphrase = useCallback(async () => {
    return await new Promise<string>((resolve, reject) => {
      // TODO(ivan): implementation
      if (signingRef.current?.prompt !== undefined) {
        signingRef.current.resolve = resolve
        signingRef.current.reject = reject
        signingRef.current.prompt()
      } // else UI not ready
    })
  }, [])

  const wallet = useMemo(() => {
    const provider = MnemonicEncrypted.initProvider(props.data, network, promptPassphrase)
    return initWhaleWallet(provider, network, client)
  }, [])

  return (
    <WalletContext.Provider value={wallet}>
      <EncryptedWalletContext.Provider value={signingRef}>
        {props.children}
      </EncryptedWalletContext.Provider>
    </WalletContext.Provider>
  )
}
