import { WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { MnemonicHdNode } from '@defichain/jellyfish-wallet-mnemonic'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { initJellyfishWallet, MnemonicEncrypted, MnemonicUnprotected } from '@api/wallet'
import { getJellyfishNetwork } from '@shared-api/wallet/network'
import { signAsync } from 'bitcoinjs-message'
import { DFXAddrSignature, DFXPersistence } from '@api/persistence/dfx_storage'
import { WalletType } from '@shared-contexts/WalletPersistenceContext'
import { authentication, Authentication } from '@store/authentication'
import { translate } from '@translations'
import { signIn, signUp } from '@shared-api/dfx/ApiService'
import { AuthService } from '@shared-api/dfx/AuthService'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useDispatch } from 'react-redux'
import * as React from 'react'
import { createContext, PropsWithChildren, useContext, useEffect } from 'react'

interface DFXAPIContextI {
  dfxWebToken: () => Promise<string>
}

const DFXAPIContext = createContext<DFXAPIContextI>(undefined as any)

export function useDFXAPIContext (): DFXAPIContextI {
  return useContext(DFXAPIContext)
}

export function DFXAPIContextProvider (props: PropsWithChildren<{}>): JSX.Element | null {
  const { network } = useNetworkContext()
  const { data: providerData } = useWalletNodeContext()
  const logger = useLogger()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const { address } = useWalletContext()

  /**
   * Returns webtoken string of current active Wallet address
   * @returns string
   */
  const getActiveWebToken = async (): Promise<string> => {
    let webToken = await DFXPersistence.getToken(address)
    if (webToken === undefined || webToken.length === 0) {
        await createWebToken(address)
        webToken = await DFXPersistence.getToken(address)
    }

    if (webToken !== undefined) {
        await AuthService.updateSession({ accessToken: webToken })
    }
    return webToken
  }

  /**
   * Check if Web session is expired
   * @returns Promise<boolean>
   */
  const isSessionExpired = async (): Promise<boolean> => {
    const session = await AuthService.Session
    return session.isExpired
  }

  /**
   * Start signing process and return signature
   * @param address string
   * @return Promise<void>
   */
  const createSignature = async (address: string): Promise<void> => {
    /**
     * Signing message callback
     * @param provider
     * @returns Promise<Buffer>
     */
    const signMessage = async (provider: WalletHdNodeProvider<MnemonicHdNode>): Promise<Buffer> => {
        const activeIndex = await WalletAddressIndexPersistence.getActive()
        const account = initJellyfishWallet(provider, network, whaleApiClient).get(activeIndex)
        const privKey = await account.privateKey()
        const messagePrefix = getJellyfishNetwork(network).messagePrefix
        const message = `By signing this message, you confirm that you are the sole owner of the provided DeFiChain address and are in possession of its private key. Your ID: ${address}`
        .split(' ')
        .join('_')
        return await signAsync(message, privKey, true, messagePrefix)
    }

    /**
     * Message signed Callback
     * @param signature Buffer
     * @returns Promise<void>
     */
    const onMessageSigned = async (sigBuffer: Buffer): Promise<void> => {
        const sig = sigBuffer.toString('base64')
        await DFXPersistence.setPair({
            addr: address,
            signature: sig
        })
        await DFXPersistence.resetPin()
    }

    /**
     * Show Authentication Prompt
     */
    if (providerData.type === WalletType.MNEMONIC_UNPROTECTED) {
        const provider = MnemonicUnprotected.initProvider(providerData, network)
        const sigBuffer = await signMessage(provider)
        await onMessageSigned(sigBuffer)
      } else if (providerData.type === WalletType.MNEMONIC_ENCRYPTED) {
        const pin = await DFXPersistence.getWalletPin()
        if (pin.length === 0) {
          const auth: Authentication<Buffer> = {
            consume: async passphrase => {
              const provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: async () => passphrase })
              return await signMessage(provider)
            },
            onAuthenticated: onMessageSigned,
            onError: e => logger.error(e),
            message: translate('screens/UnlockWallet', 'To access DFX Services, we need you to enter your passcode.'),
            loading: translate('screens/TransactionAuthorization', 'Verifying access')
          }

          dispatch(authentication.actions.prompt(auth))
        } else {
          const provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: async () => pin })
          const sigBuffer = await signMessage(provider)
          await onMessageSigned(sigBuffer)
        }
      } else {
        throw new Error('Missing wallet provider data handler')
      }
  }

  /**
   * Start sign in/up process and set web token to pair
   * @param address string
   * @return Promise<void>
   */
  const createWebToken = async (address: string): Promise<void> => {
    const pair = await DFXPersistence.getPair(address)
    if (pair.signature === undefined || pair.signature.length === 0) {
        await createSignature(address)
    }

    /**
     * First try, sign up
     */
    // reset session web token
    await AuthService.deleteSession()
    // try sign in
    const signa = pair.signature ?? undefined
    if (signa === undefined) {
        throw new Error('signature is undefined')
    }

    await signIn({ address: pair.addr, signature: signa })
        .then(async respWithToken => {
            await DFXPersistence.setToken(pair.addr, respWithToken)
        })
        .catch(async resp => {
            await DFXPersistence.resetToken(pair.addr)

            // try sign up
            await signUp({ address: pair.addr, signature: signa, walletId: 1, usedRef: null })
                .then(async respWithToken => {
                    await DFXPersistence.setToken(pair.addr, respWithToken)
                })
                .catch(async resp => {
                    throw new Error(resp)
                })
        })
  }

  /**
   * Create/Update DFX Addr Signature Pair
   * @param pair DFXAddrSignature
   */
  const activePairHandler = async (pair: DFXAddrSignature): Promise<void> => {
    // - do we have a signature?
    if (pair.signature === undefined || pair.signature.length === 0) {
        await createSignature(pair.addr).catch(error => console.log('activePairHandler -> createSignatureError', error))
    }

    // - do we have a web token?
    // - do we have an active web session?
    if (pair.token === undefined || pair.token.length === 0 || await isSessionExpired()) {
        await createWebToken(pair.addr).catch(error => console.log('activePairHandler -> createWebTokenError', error))
    }

    // Set web session token
    const webToken = await DFXPersistence.getToken(pair.addr)
    if (webToken !== undefined && webToken.length > 0) {
        await AuthService.updateSession({ accessToken: webToken }).catch(e => console.error(e))
    }
  }

  /**
   * Public Context API
   */
  const context: DFXAPIContextI = {
    dfxWebToken: getActiveWebToken
  }

    // observe address state change
    useEffect(() => {
        DFXPersistence.getPair(address).then(async pair => {
            await activePairHandler(pair).catch(error => {
 throw new Error(error)
})
        }).catch(async () => {
            await activePairHandler({ addr: address, signature: undefined, token: undefined }).catch(error => {
 throw new Error(error)
})
        })
    }, [address])

  return (
    <DFXAPIContext.Provider value={context}>
      {props.children}
    </DFXAPIContext.Provider>
  )
}
