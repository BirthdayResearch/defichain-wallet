import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MnemonicProviderData } from '@defichain/jellyfish-wallet-mnemonic'
import { useNavigation } from '@react-navigation/native'
import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react'
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

const WalletContext = createContext<WhaleWallet>(undefined as any)

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
  const navigation = useNavigation()

  const promptPassphrase = useCallback(async () => {
    return await new Promise<string>((resolve, reject) => {
      // TODO(ivan): implementation
      navigation.navigate('PromptPassphrase', {
        resolve (passphrase: string) {
          resolve(passphrase)
        },
        reject (error: Error) {
          reject(error)
        }
      })
    })
  }, [])

  const wallet = useMemo(() => {
    const provider = MnemonicEncrypted.initProvider(props.data, network, promptPassphrase)
    return initWhaleWallet(provider, network, client)
  }, [])

  return (
    <WalletContext.Provider value={wallet}>
      {props.children}
    </WalletContext.Provider>
  )
}
