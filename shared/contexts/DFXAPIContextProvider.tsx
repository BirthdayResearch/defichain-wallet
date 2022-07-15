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
import { getSellRoutes, signIn, signUp, getCountries } from '@shared-api/dfx/ApiService'
import { AuthService } from '@shared-api/dfx/AuthService'
import { useNetworkContext } from '@shared-contexts/NetworkContext'
import { useWalletNodeContext } from '@shared-contexts/WalletNodeProvider'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useDispatch } from 'react-redux'
import * as React from 'react'
import { createContext, PropsWithChildren, useContext, useEffect } from 'react'
import { Linking } from 'react-native'
import { getEnvironment } from '@environment'
import * as Updates from 'expo-updates'
import { useDebounce } from '@hooks/useDebounce'
import { SellRoute } from '@shared-api/dfx/models/SellRoute'
import { Country } from '@shared-api/dfx/models/Country'

interface DFXAPIContextI {
  openDfxServices: () => Promise<void>
  clearDfxTokens: () => Promise<void>
  listFiatAccounts: () => Promise<SellRoute[]>
  listCountries: () => Promise<Country[]>
}

const DFXAPIContext = createContext<DFXAPIContextI>(undefined as any)

export function useDFXAPIContext (): DFXAPIContextI {
  // console.log('useDFXAPIContext') // TODO: instrument and remove
  return useContext(DFXAPIContext)
}

export function DFXAPIContextProvider (props: PropsWithChildren<{}>): JSX.Element | null {
  const { network, networkName } = useNetworkContext()
  const { data: providerData } = useWalletNodeContext()
  const logger = useLogger()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const { address } = useWalletContext()
  const debouncedAddress = useDebounce(address, 500)
  const debouncedNetworkName = useDebounce(address, 500)

  const openDfxServices = async (): Promise<void> => {
    await getActiveWebToken()
      .catch(async () => {
        // try login first
        await activePairHandler({ network: networkName, addr: address })
        return await getActiveWebToken()
      })
      .then(async (token) => {
        if (token === undefined || token.length === 0) {
          throw new Error('webToken is undefined')
        }

        const baseUrl = getEnvironment(Updates.releaseChannel).dfxPaymentUrl
        const url = `${baseUrl}/login?token=${token}`
        // console.log(url) // TODO!!! (thabrad) comment out / REMOVE!!
        await Linking.openURL(url)
      })
      .catch(logger.error)
  }

  const listFiatAccounts = async (): Promise<SellRoute[]> => {
    return await getSellRoutes()
  }

  const listCountries = async (): Promise<Country[]> => {
    return await getCountries()
  }

  // returns webtoken string of current active Wallet address
  const getActiveWebToken = async (): Promise<string> => {
    let webToken = await DFXPersistence.getToken(address)

    // TODO: (thabrad) quick fix - recheck
    webToken = ''

    if (webToken === undefined || webToken.length === 0) {
        await createWebToken(address)
        webToken = await DFXPersistence.getToken(address)
    }

    if (webToken !== undefined) {
        await AuthService.updateSession({ accessToken: webToken })
    }
    return webToken
  }

  // check if Web session is expired
  const isSessionExpired = async (): Promise<boolean> => {
    const session = await AuthService.Session
    return session.isExpired
  }

  // start signing process and return signature
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

    // message signed callback
    const onMessageSigned = async (sigBuffer: Buffer): Promise<void> => {
      const sig = sigBuffer.toString('base64')
      await DFXPersistence.setPair({
        network: networkName,
        addr: address,
        signature: sig
      })
      await DFXPersistence.resetPin()
    }

    // show authentication Prompt
    if (providerData.type === WalletType.MNEMONIC_UNPROTECTED) {
        const provider = MnemonicUnprotected.initProvider(providerData, network)
        const sigBuffer = await signMessage(provider)
        await onMessageSigned(sigBuffer)
      } else if (providerData.type === WalletType.MNEMONIC_ENCRYPTED) {
        const pin = await DFXPersistence.getWalletPin()
        if (pin.length === 0) {
          await new Promise<void>((resolve, reject) => {
            const auth: Authentication<Buffer> = {
              consume: async passphrase => {
                const provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: async () => passphrase })
                return await signMessage(provider)
              },
              onAuthenticated: async (buffer) => {
                await onMessageSigned(buffer)
                resolve()
              },
              onError: e => reject(e),
              message: translate('screens/UnlockWallet', 'To access DFX Services, we need you to enter your passcode.'),
              loading: translate('screens/TransactionAuthorization', 'Verifying access')
            }

            dispatch(authentication.actions.prompt(auth))
          })
        } else {
          const provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: async () => pin })
          const sigBuffer = await signMessage(provider)
          await onMessageSigned(sigBuffer)
        }
      } else {
        throw new Error('Missing wallet provider data handler')
      }
  }

  // start sign in/up process and set web token to pair
  const createWebToken = async (address: string): Promise<void> => {
    const pair = await DFXPersistence.getPair(address)
    if (pair.signature === undefined || pair.signature.length === 0) {
        await createSignature(address)
    }

    // first try, sign up
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
          if (resp.statusCode !== undefined && resp.statusCode === 401) {
            // Invalid credentials
            // -> fetch signature
            await createSignature(pair.addr)
            return
          }

          // try sign up
          await signUp({ address: pair.addr, signature: signa, walletId: 1, usedRef: null })
              .then(async respWithToken => {
                  await DFXPersistence.setToken(pair.addr, respWithToken)
              })
              .catch(async resp => {
                  if (resp.message !== undefined) {
                      throw new Error(resp.message)
                  }
                  throw new Error(resp)
              })
        })
  }

  // create/update DFX addr signature pair
  const activePairHandler = async (pair: DFXAddrSignature): Promise<void> => {
    // - do we have a signature?
    if (pair.signature === undefined || pair.signature.length === 0) {
      await createSignature(pair.addr).catch(logger.error)
    }

    // - do we have a web token?
    // - do we have an active web session?
    if (pair.token === undefined || pair.token.length === 0 || await isSessionExpired()) {
        await createWebToken(pair.addr).catch(logger.error)
    }

    // Set web session token
    const webToken = await DFXPersistence.getToken(pair.addr)
    if (webToken !== undefined && webToken.length > 0) {
        await AuthService.updateSession({ accessToken: webToken }).catch(() => {})
    }
  }

  const clearDfxTokens = async (): Promise<void> => {
    await DFXPersistence.reset(networkName)
  }

  // public context API
  const context: DFXAPIContextI = {
    openDfxServices: openDfxServices,
    clearDfxTokens: clearDfxTokens,
    listFiatAccounts: listFiatAccounts,
    listCountries: listCountries
  }

  // observe address state change
  useEffect(() => {
      DFXPersistence.getPair(debouncedAddress).then(async pair => {
        await activePairHandler(pair).catch(() => {})
      }).catch(async () => {
        await activePairHandler({ network: networkName, addr: debouncedAddress, signature: undefined, token: undefined }).catch(() => {})
      })
  }, [debouncedAddress])

  // observe network state change
  useEffect(() => {
    void (async () => {
      await activePairHandler({ network: networkName, addr: debouncedAddress, signature: undefined, token: undefined }).catch(() => { })
    })
  }, [debouncedNetworkName])

  return (
    <DFXAPIContext.Provider value={context}>
      {props.children}
    </DFXAPIContext.Provider>
  )
}
