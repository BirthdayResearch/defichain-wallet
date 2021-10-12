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
import { useNetworkContext } from '@contexts/NetworkContext'
import { useWalletNodeContext } from '@contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '@contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import { RootState } from '@store'
import { authentication as authenticationStore } from '@store/authentication'
import { ocean } from '@store/ocean'
import { first, transactionQueue } from '@store/transaction_queue'
import { translate } from '@translations'
import { PasscodePrompt } from './PasscodePrompt'
import {
  alertUnlinkWallet,
  authenticateFor,
  signTransaction
} from '@screens/TransactionAuthorization/transaction_signer'

export const MAX_PASSCODE_ATTEMPT = 3 // allowed 2 failures
export const PIN_LENGTH = 6
export const DEFAULT_MESSAGES = {
  message: 'Enter passcode to continue',
  loadingMessage: 'Signing your transaction...',
  authorizedTransactionMessage: {
    title: 'Transaction authorized',
    description: 'Please wait as your transaction is prepared'
  },
  grantedAccessMessage: {
    title: 'Access granted',
    description: 'You may now proceed'
  }
}
const SUCCESS_DISPLAY_TIMEOUT_IN_MS = 2000
const CANCELED_ERROR = 'canceled error'

/**
 * useRef() working well on web but not on mobile
 * (do not resolve/reject func ref do not survive re-render, any UI state update)
 */
let PASSPHRASE_PROMISE_PROXY: {
  resolve: (pass: string) => void
  reject: (e: Error) => void
} | undefined

export const INVALID_HASH = 'invalid hash'
export const USER_CANCELED = 'USER_CANCELED'

export type Status = 'INIT' | 'IDLE' | 'BLOCK' | 'PIN' | 'SIGNING' | 'AUTHORIZED' | 'MULTI_TX'

let CACHED_PIN = ''

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
  const transactions = useSelector((state: RootState) => state.transactionQueue.transactions)
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
  const onPinInput = (inputPin: string): void => {
    if (inputPin.length === PIN_LENGTH && PASSPHRASE_PROMISE_PROXY !== undefined) {
      const resolve = PASSPHRASE_PROMISE_PROXY.resolve
      CACHED_PIN = inputPin
      setTimeout(() => {
        resolve(inputPin)
        // remove proxied promised, allow next prompt() call
        PASSPHRASE_PROMISE_PROXY = undefined
      }, 50)
      emitEvent('SIGNING')
    }
    setPin(inputPin)
  }

  const onCancel = useCallback((): void => {
    if (PASSPHRASE_PROMISE_PROXY !== undefined) {
      PASSPHRASE_PROMISE_PROXY.reject(new Error(USER_CANCELED))
      // remove proxied promised, allow next prompt() call
      PASSPHRASE_PROMISE_PROXY = undefined
    } else if (status === 'AUTHORIZED') {
      PASSPHRASE_PROMISE_PROXY = undefined
      transaction === undefined
        ? dispatch(authenticationStore.actions.dismiss())
        : dispatch(transactionQueue.actions.pop())
      onTaskCompletion()
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
        resolve,
        reject
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
    CACHED_PIN = ''
    setPin('')
    setIsRetry(false)
    setMessage(DEFAULT_MESSAGES.message)
    setLoadingMessage(DEFAULT_MESSAGES.loadingMessage)
    emitEvent('IDLE') // very last step, open up for next task
  }

  const setupNewWallet = (passpromptPinPromise: () => Promise<string>): void => {
    let provider: WalletHdNodeProvider<MnemonicHdNode>
    if (providerData.type === WalletType.MNEMONIC_UNPROTECTED) {
      provider = MnemonicUnprotected.initProvider(providerData, network)
    } else if (providerData.type === WalletType.MNEMONIC_ENCRYPTED) {
      provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: passpromptPinPromise })
    } else {
      throw new Error('Missing wallet provider data handler')
    }
    setWallet(initJellyfishWallet(provider, network, whaleApiClient))
  }

  const onPinSuccess = async (postAction: any, signedTx: CTransactionSegWit, isLastTX: boolean, cachedPin: string): Promise<void> => {
    let linkedAction
    if (isLastTX) {
      emitEvent('AUTHORIZED')
      await resetPasscodeCounter()
    } else {
      linkedAction = () => {
        emitEvent('MULTI_TX')
        dispatch(transactionQueue.actions.pop())
      }
    }
    dispatch(ocean.actions.queueTransaction({
      tx: signedTx,
      postAction,
      linkedAction
    })) // push signed result for broadcasting
  }

  // mandatory UI initialization
  useEffect(() => {
    setupNewWallet(onPrompt)
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
    if (status !== 'IDLE' && status !== 'MULTI_TX') {
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
          await onPinSuccess(transaction.postAction, signedTx, transactions.length === 1, CACHED_PIN)
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

          // case 3: canceled
          throw new Error(CANCELED_ERROR) // pass to last catch so all cases will complete task
        })
        .catch(e => {
          dispatch(transactionQueue.actions.pop()) // remove job
          onTaskCompletion()

          if (e.message !== CANCELED_ERROR) { // no need to log if user cancels
            Logging.error(e)
          }
        })
    } else if (authentication !== undefined) {
      emitEvent('BLOCK') // prevent any re-render trigger (between IDLE and PIN)
      setMessage(authentication.message)
      setLoadingMessage(authentication.loading)

      authenticateFor(onPrompt, authentication, onRetry, retries)
        .then(async () => {
          // case 1: success
          emitEvent('AUTHORIZED')
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

          // case 3: canceled
          throw new Error(CANCELED_ERROR) // pass to last catch so all cases will complete task
        })
        .catch(e => {
          dispatch(authenticationStore.actions.dismiss())
          onTaskCompletion()

          if (e.message !== CANCELED_ERROR) { // no need to log if user cancels
            Logging.error(e)
          }
        })
    }
  }, [transaction, wallet, status, authentication, attemptsRemaining])

  // auto resolve with cached pin if any
  useEffect(() => {
    if (status === 'PIN' && pin.length === PIN_LENGTH) {
      onPinInput(pin)
    }
  }, [status, pin])

  // reset UI after n seconds
  useEffect(() => {
    if (status === 'AUTHORIZED') {
      setTimeout(() => {
        transaction === undefined
          ? dispatch(authenticationStore.actions.dismiss())
          : dispatch(transactionQueue.actions.pop())
        PASSPHRASE_PROMISE_PROXY = undefined
        onTaskCompletion()
      }, SUCCESS_DISPLAY_TIMEOUT_IN_MS)
    }
  }, [status])

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
      grantedAccessMessage={
        {
          title: translate('screens/UnlockWallet', DEFAULT_MESSAGES.grantedAccessMessage.title),
          description: translate('screens/UnlockWallet', DEFAULT_MESSAGES.grantedAccessMessage.description)
        }
      }
      isRetry={isRetry}
      attemptsRemaining={attemptsRemaining}
      maxPasscodeAttempt={MAX_PASSCODE_ATTEMPT}
    />
  )
}
