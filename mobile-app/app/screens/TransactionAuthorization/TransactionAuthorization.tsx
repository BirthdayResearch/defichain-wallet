import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { JellyfishWallet, WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { MnemonicHdNode } from '@defichain/jellyfish-wallet-mnemonic'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '@api'
import {
  initJellyfishWallet,
  MnemonicEncrypted,
  MnemonicUnprotected,
  PasscodeAttemptCounter,
  WalletType
} from '../../api/wallet'
import { WalletAlert } from '@components/WalletAlert'
import { useNetworkContext } from '@contexts/NetworkContext'
import { useWalletNodeContext } from '@contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import { RootState } from '@store'
import { Authentication, authentication as authenticationStore } from '@store/authentication'
import { ocean } from '@store/ocean'
import { DfTxSigner, first, transactionQueue } from '@store/transaction_queue'
import { translate } from '@translations'
import { PasscodePrompt } from './PasscodePrompt'

const MAX_PASSCODE_ATTEMPT = 3 // allowed 2 failures
const PIN_LENGTH = 6
const DEFAULT_MESSAGES = {
  message: 'Enter passcode to continue',
  loadingMessage: 'Signing your transaction...',
  authorizedTransactionMessage: {
    title: 'Transaction authorized',
    description: 'Please wait as your transaction is prepared'
  }
}

/**
 * useRef() working well on web but not on mobile
 * (do not resolve/reject func ref do not survive re-render, any UI state update)
 */
let PASSPHRASE_PROMISE_PROXY: {
  resolve: (pass: string) => void
  reject: (e: Error) => void
} | undefined

const INVALID_HASH = 'invalid hash'
const USER_CANCELED = 'USER_CANCELED'

export type Status = 'INIT' | 'IDLE' | 'BLOCK' | 'PIN' | 'SIGNING' | 'AUTHORIZED'

/**
 * The main UI page transaction signing logic interact with encrypted wallet context
 */
export function TransactionAuthorization (): JSX.Element | null {
  // context
  const { data: providerData } = useWalletNodeContext()
  const { clearWallets } = useWalletPersistenceContext()
  const { network } = useNetworkContext()
  const whaleApiClient = useWhaleApiClient()

  // store
  const dispatch = useDispatch()
  const transaction = useSelector((state: RootState) => first(state.transactionQueue))
  const authentication = useSelector((state: RootState) => state.authentication.authentication)

  // computed state
  const [status, emitEvent] = useState<Status>('INIT')
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(MAX_PASSCODE_ATTEMPT)
  const [pin, setPin] = useState<string>('')
  const [isRetry, setIsRetry] = useState(false)

  // wallet with (provider with prompting UI attached)
  const [wallet, setWallet] = useState<JellyfishWallet<WhaleWalletAccount, MnemonicHdNode>>()

  // messages
  const [message, setMessage] = useState(DEFAULT_MESSAGES.message)
  const [loadingMessage, setLoadingMessage] = useState(DEFAULT_MESSAGES.loadingMessage)

  // generic callbacks
  const onPinInput = useCallback((pin: string): void => {
    if (pin.length === PIN_LENGTH && PASSPHRASE_PROMISE_PROXY !== undefined) {
      const resolve = PASSPHRASE_PROMISE_PROXY.resolve
      setTimeout(() => {
        resolve(pin)
        // remove proxied promised, allow next prompt() call
        PASSPHRASE_PROMISE_PROXY = undefined
      }, 50)
      emitEvent('SIGNING')
    }
    setPin(pin)
  }, [PASSPHRASE_PROMISE_PROXY, PASSPHRASE_PROMISE_PROXY?.resolve])

  const onCancel = useCallback((): void => {
    if (PASSPHRASE_PROMISE_PROXY !== undefined) {
      PASSPHRASE_PROMISE_PROXY.reject(new Error(USER_CANCELED))
      // remove proxied promised, allow next prompt() call
      PASSPHRASE_PROMISE_PROXY = undefined
    }
  }, [PASSPHRASE_PROMISE_PROXY, PASSPHRASE_PROMISE_PROXY?.reject])

  const onRetry = useCallback(async (attempts: number) => {
    setPin('')
    setIsRetry(true)
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - attempts)
    await PasscodeAttemptCounter.set(attempts)
  }, [attemptsRemaining])

  const onPrompt = useCallback(async () => {
    if (PASSPHRASE_PROMISE_PROXY !== undefined) {
      throw new Error('prompt UI occupied')
    }
    return await new Promise<string>((resolve, reject) => {
      // passphrase prompt is meant for authorizing single transaction regardless
      // caller should not prompt for next transaction before one is completed
      // proxy the promise, wait for user input
      PASSPHRASE_PROMISE_PROXY = {
        resolve, reject
      }
      // setPin('') // do not reset, keep pin cached until onTaskCompletion
      emitEvent('PIN')
    })
  }, [])

  const resetPasscodeCounter = useCallback(async () => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT)
    await PasscodeAttemptCounter.set(0)
  }, [])

  const onTaskCompletion = (): void => {
    setPin('')
    setIsRetry(false)
    setMessage(DEFAULT_MESSAGES.message)
    setLoadingMessage(DEFAULT_MESSAGES.loadingMessage)
    emitEvent('IDLE') // very last step, open up for next task
  }

  // mandatory UI initialization
  useEffect(() => {
    let provider: WalletHdNodeProvider<MnemonicHdNode>
    if (providerData.type === WalletType.MNEMONIC_UNPROTECTED) {
      provider = MnemonicUnprotected.initProvider(providerData, network)
    } else if (providerData.type === WalletType.MNEMONIC_ENCRYPTED) {
      provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: onPrompt })
    } else {
      throw new Error('Missing wallet provider data handler')
    }
    setWallet(initJellyfishWallet(provider, network, whaleApiClient))

    PasscodeAttemptCounter.get()
      .then(counter => {
        setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - counter)
        emitEvent('IDLE')
      })
      .catch(error => {
        Logging.error(error)
        throw error
      })
  }, [providerData, network, whaleApiClient])

  /**
   * Currently serving
   * 1. consume pending to sign store/TransactionQueue
   * 2. generic authentication job store/Authentication
   */
  useEffect(() => {
    if (status !== 'IDLE') {
      // wait for prompt UI is ready again
      return
    }

    if (attemptsRemaining === 0) {
      return
    }

    const retries = MAX_PASSCODE_ATTEMPT - attemptsRemaining
    if (transaction !== undefined && // any tx queued
      wallet !== undefined // just in case any data stuck in store
    ) {
      emitEvent('BLOCK') // prevent any re-render trigger (between IDLE and PIN)
      signTransaction(transaction, wallet.get(0), onRetry, retries)
        .then(async signedTx => {
          // case 1: success
          await resetPasscodeCounter()
          emitEvent('AUTHORIZED')
          dispatch(ocean.actions.queueTransaction({ tx: signedTx, postAction: transaction.postAction })) // push signed result for broadcasting
        })
        .catch(async e => {
          if (e.message === INVALID_HASH) {
            // case 2: invalid passcode
            await resetPasscodeCounter()
            await clearWallets()
            alertUnlinkWallet()
          } else if (e.message !== USER_CANCELED) {
            // case 4: unknown error type
            dispatch(ocean.actions.setError(e))
          }
          // case 3: canceled, no special handling required
        })
        .catch(e => Logging.error(e)) // not expect logic reach here
        .finally(() => {
          setTimeout(() => {
            dispatch(transactionQueue.actions.pop()) // remove job
            onTaskCompletion()
          }, 2000)
        })
    } else if (authentication !== undefined) {
      emitEvent('BLOCK') // prevent any re-render trigger (between IDLE and PIN)

      setMessage(authentication.message)
      setLoadingMessage(authentication.loading)

      authenticateFor(onPrompt, authentication, onRetry, retries)
        .then(async () => {
          // case 1: success
          await resetPasscodeCounter()
        })
        .catch(async e => {
          if (e.message === INVALID_HASH) {
            // case 2: invalid passcode
            await resetPasscodeCounter()
            await clearWallets()
            alertUnlinkWallet()
          } else if (e.message !== USER_CANCELED && authentication.onError !== undefined) {
            // case 4: unknown error type
            authentication.onError(e)
          }
          // case 3: canceled, no handling required atm
        })
        .catch(e => Logging.error(e))
        .finally(() => {
          dispatch(authenticationStore.actions.dismiss())
          onTaskCompletion()
        })
    }
  }, [transaction, wallet, status, authentication, attemptsRemaining])

  // auto resolve with cached pin if any
  useEffect(() => {
    if (status === 'PIN' && pin.length === PIN_LENGTH) {
      onPinInput(pin)
    }
  }, [status, pin])

  if (status === 'INIT' || status === 'IDLE' || status === 'BLOCK') {
    return null
  }

  return (
    <PasscodePrompt
      onCancel={onCancel}
      message={translate('screens/UnlockWallet', message)}
      transaction={transaction}
      status={status}
      pinLength={PIN_LENGTH}
      onPinInput={onPinInput}
      pin={pin}
      loadingMessage={translate('screens/TransactionAuthorization', loadingMessage)}
      authorizedTransactionMessage={
        {
          title: translate('screens/TransactionAuthorization', DEFAULT_MESSAGES.authorizedTransactionMessage.title),
          description: translate('screens/TransactionAuthorization', DEFAULT_MESSAGES.authorizedTransactionMessage.description)
        }
      }
      isRetry={isRetry}
      attemptsRemaining={attemptsRemaining}
      maxPasscodeAttempt={MAX_PASSCODE_ATTEMPT}
    />
  )
}

async function execWithAutoRetries (promptPromise: () => Promise<any>, onAutoRetry: (attempts: number) => Promise<void>, retries: number = 0): Promise<any> {
  try {
    return await promptPromise()
  } catch (e: any) {
    Logging.error(e)
    if (e.message === INVALID_HASH && ++retries < MAX_PASSCODE_ATTEMPT) {
      await onAutoRetry(retries)
      return await execWithAutoRetries(promptPromise, onAutoRetry, retries)
    }
    throw e
  }
}

// store/transactionQueue execution
async function signTransaction (tx: DfTxSigner, account: WhaleWalletAccount, onAutoRetry: (attempts: number) => Promise<void>, retries: number = 0): Promise<CTransactionSegWit> {
  return await execWithAutoRetries(async () => (await tx.sign(account)), onAutoRetry, retries)
}

// store/authentication execution
async function authenticateFor<T> (
  promptPassphrase: () => Promise<string>,
  authentication: Authentication<T>,
  onAutoRetry: (attempts: number) => Promise<void>,
  retries: number = 0
): Promise<void> {
  const customJob = async (): Promise<void> => {
    const passphrase = await promptPassphrase()
    const result = await authentication.consume(passphrase)
    return await authentication.onAuthenticated(result)
  }

  return await execWithAutoRetries(customJob, onAutoRetry, retries)
}

function alertUnlinkWallet (): void {
  WalletAlert({
    title: translate('screens/PinConfirmation', 'Wallet Unlinked'),
    message: translate('screens/PinConfirmation', 'Your wallet was unlinked for your safety due to successive passcode failures. Please use recovery words to restore and set up your wallet again.'),
    buttons: [
      {
        text: translate('screens/PinConfirmation', 'Close'),
        style: 'destructive'
      }
    ]
  })
}
