import { WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { MnemonicHdNode } from '@defichain/jellyfish-wallet-mnemonic'
import { WalletAddressIndexPersistence } from '@api/wallet/address_index'
import { initJellyfishWallet, MnemonicEncrypted, MnemonicUnprotected } from '@api/wallet'
import { getJellyfishNetwork } from '@shared-api/wallet/network'
import { signAsync } from 'bitcoinjs-message'
import { DFXPersistence } from '@api/persistence/dfx_storage'
import { WalletType } from '@shared-contexts/WalletPersistenceContext'
import { authentication, Authentication } from '@store/authentication'
import { translate } from '@translations'
import { signIn, signUp } from '@shared-api/dfx/ApiService'
import { AuthService, Session } from '@shared-api/dfx/AuthService'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useDispatch } from 'react-redux'
import * as React from 'react'
import { createContext, PropsWithChildren, useContext, useEffect } from 'react'

interface DFXAPIContextI {
  dfxToken: () => Promise<string>
  dfxFetchSignature: (passphrase?: string) => Promise<void>
  dfxUpdateSession: () => Promise<void>
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
  const { address } = useWalletContext()
  const dispatch = useDispatch()

  async function signMessage (provider: WalletHdNodeProvider<MnemonicHdNode>): Promise<Buffer> {
    const activeIndex = await WalletAddressIndexPersistence.getActive()
    const account = initJellyfishWallet(provider, network, whaleApiClient).get(activeIndex)

    const privKey = await account.privateKey()
    const messagePrefix = getJellyfishNetwork(network).messagePrefix
    const message = `By signing this message, you confirm that you are the sole owner of the provided DeFiChain address and are in possession of its private key. Your ID: ${address}`
      .split(' ')
      .join('_')

    return await signAsync(message, privKey, true, messagePrefix)
  }

  async function onMessageSigned (signature: Buffer): Promise<void> {
    const sig = signature.toString('base64')

    // Add or update pair
    await DFXPersistence.setPair({
      addr: address,
      signature: sig
    })

    // Reset pin
    await DFXPersistence.resetPin()

    await updateSession()
  }

  const fetchSignature = async (): Promise<void> => {
    if (providerData.type === WalletType.MNEMONIC_UNPROTECTED) {
      const provider = MnemonicUnprotected.initProvider(providerData, network)
      const signature = await signMessage(provider)
      await onMessageSigned(signature)
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
        const signature = await signMessage(provider)
        await onMessageSigned(signature)
      }
    } else {
      throw new Error('Missing wallet provider data handler')
    }
  }

  // DFX API Sign in
  async function trySignIn (addr: string, signature: string): Promise<boolean> {
    return await signIn({ address: addr, signature: signature })
      .then(async respToken => {
        await DFXPersistence.setToken(addr, respToken)
        return true
      })
      .catch(async resp => {
        await DFXPersistence.setToken(addr, '')
        return false
      })
  }

// DFX API Sign up
  async function trySignUp (addr: string, signature: string): Promise<boolean> {
    return await signUp({ address: addr, signature: signature, walletId: 1, usedRef: null })
      .then(async (resp) => {
        await DFXPersistence.setToken(addr, resp)
        return true
      })
      .catch(async (resp) => {
        await DFXPersistence.setToken(addr, '')
        if (resp.statusCode === 409) {
          return false
        } else if (resp.statusCode === 400) {
          // invalid signature
          DFXPersistence.getPair(addr).then(async (pair) => {
            pair.signature = ''
            pair.token = ''
            await DFXPersistence.setPair(pair)
          }).catch(() => 'nothing to show here')
          return false
        }
        console.error(resp)
        return false
      })
  }

  const updateSession = async (): Promise<void> => {
    return await DFXPersistence.getPair(address).then(async activePair => {
      if (activePair.signature.length === 0) {
        // active pair has no signature
        await fetchSignature()
      }

      const session = await AuthService.Session
      if (activePair.token === undefined || activePair.token.length === 0 || session.isExpired) {
        // active pair has no token yet or session is expired
        await trySignIn(activePair.addr, activePair.signature).then(async (result) => {
          if (!result) {
            // sign in failed, try to signup
            await trySignUp(activePair.addr, activePair.signature)
          }
        })
      }

      // session update
      const token = await DFXPersistence.getToken(activePair.addr)
      await AuthService.updateSession({ accessToken: token })
    }).catch(async reason => {
      if (!await DFXPersistence.hasPair(address)) {
        // address unknown, fetch signature
        await fetchSignature()
      }
    })
  }

  const fetchActiveToken = async (): Promise<string> => {
    return await DFXPersistence.getToken(address)
  }

  const context: DFXAPIContextI = {
    dfxToken: fetchActiveToken,
    dfxFetchSignature: fetchSignature,
    dfxUpdateSession: updateSession
  }

  useEffect(() => {
    if (address === undefined) {
      return
    }

    // this is updated once per second
    AuthService.Session.then((session: Session) => {
      if (session.isExpired) {
        updateSession().catch(() => 'ignore')
      }
    }).catch((reason: any) => {
      console.error(reason)
    })
  }, [address, updateSession])

  useEffect(() => {
    dispatch(async () => {
      await updateSession()
    })
  }, [dispatch, address, updateSession])

  return (
    <DFXAPIContext.Provider value={context}>
      {props.children}
    </DFXAPIContext.Provider>
  )
}
