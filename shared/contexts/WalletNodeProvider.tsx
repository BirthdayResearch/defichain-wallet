import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { WalletHdNode, WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { EncryptedProviderData } from '@defichain/jellyfish-wallet-encrypted'
import { MnemonicProviderData } from '@defichain/jellyfish-wallet-mnemonic'
import { useNetworkContext } from './NetworkContext'
import { WalletPersistenceDataI, WalletType } from './WalletPersistenceContext'
import { MnemonicEncrypted, MnemonicUnprotected } from '../../mobile-app/app/api/wallet'

interface WalletNodeContextI {
  provider: WalletHdNodeProvider<WalletHdNode>
  /**
   * Raw WalletPersistenceDataI that is included in WalletHdNodeProvider<WalletHdNode>
   * No risk of including it in context as it's part of the provider.
   */
  data: WalletPersistenceDataI<any>
}

const WalletNodeContext = createContext<WalletNodeContextI>(undefined as any)

export function useWalletNodeContext (): WalletNodeContextI {
  return useContext(WalletNodeContext)
}

interface WalletNodeProviderProps<T> extends PropsWithChildren<any> {
  data: WalletPersistenceDataI<T>
}

/**
 * Automatically determine the correct WalletProvider to use based on the wallet type.
 */
export function WalletNodeProvider (props: WalletNodeProviderProps<any>): JSX.Element | null {
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

function MnemonicUnprotectedProvider (props: WalletNodeProviderProps<MnemonicProviderData>): JSX.Element | null {
  const { network } = useNetworkContext()

  const provider = useMemo(() => {
    return MnemonicUnprotected.initProvider(props.data, network)
  }, [network, props.data])

  return (
    <WalletNodeContext.Provider value={{ provider, data: props.data }}>
      {props.children}
    </WalletNodeContext.Provider>
  )
}

function MnemonicEncryptedProvider (props: WalletNodeProviderProps<EncryptedProviderData>): JSX.Element | null {
  const { network } = useNetworkContext()

  const provider = useMemo(() => {
    return MnemonicEncrypted.initProvider(props.data, network, {
      /**
       * wallet context only use for READ purpose (non signing)
       * see {@link TransactionAuthorization} for signing implementation
       */
      async prompt () {
        throw new Error('No UI attached for passphrase prompting')
      }
    })
  }, [network, props.data])

  return (
    <WalletNodeContext.Provider value={{ provider, data: props.data }}>
      {props.children}
    </WalletNodeContext.Provider>
  )
}
