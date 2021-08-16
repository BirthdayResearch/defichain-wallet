import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { JellyfishWallet } from '@defichain/jellyfish-wallet'
import { MnemonicHdNode } from '@defichain/jellyfish-wallet-mnemonic'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Platform, SafeAreaView, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../api'
import { initJellyfishWallet, MnemonicEncrypted, PasscodeAttemptCounter } from '../api/wallet'
import { Text, View } from '../components'
import { PinTextInput } from '../components/PinTextInput'
import { useNetworkContext } from '../contexts/NetworkContext'
import { useWalletNodeContext } from '../contexts/WalletNodeProvider'
import { useWalletPersistenceContext } from '../contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '../contexts/WhaleContext'
import { RootState } from '../store'
import { Authentication, authentication as authenticationStore } from '../store/authentication'
import { ocean } from '../store/ocean'
import { DfTxSigner, first, transactionQueue } from '../store/transaction_queue'
import { tailwind } from '../tailwind'
import { translate } from '../translations'

const MAX_PASSCODE_ATTEMPT = 4 // allowed 3 failures
const PIN_LENGTH = 6

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

type Status = 'INIT' | 'IDLE' | 'BLOCK' | 'PIN' | 'SIGNING'

/**
 * The main UI page transaction signing logic interact with encrypted wallet context
 */
export function TransactionAuthorization (): JSX.Element | null {
  // context
  const { data: providerData } = useWalletNodeContext()
  const { clearWallets } = useWalletPersistenceContext()
  const { network } = useNetworkContext()
  const whaleApiClient = useWhaleApiClient()

  // biometric related persistent storage API
  // const [isBiometric, setIsBiometric] = useState(false)

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
    emitEvent('IDLE') // very last step, open up for next task
  }

  // mandatory UI initialization
  useEffect(() => {
    const provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: onPrompt })
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
          dispatch(transactionQueue.actions.pop()) // remove job
          onTaskCompletion()
        })
    } else if (authentication !== undefined) {
      emitEvent('BLOCK') // prevent any re-render trigger (between IDLE and PIN)
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

  // Disable Biometric hook
  /* // setup biometric hook if enrolled
  useEffect(() => {
    BiometricProtectedPasscode.isEnrolled()
      .then(isEnrolled => setIsBiometric(isEnrolled))
      .catch(e => Logging.error(e))
  }, [wallet]) */

  // prompt biometric auth in 'PIN' event
  useEffect(() => {
    if (status === 'PIN' && pin.length === PIN_LENGTH) {
      onPinInput(pin)
    }

    // biometric disabled
    // if (status === 'PIN' && isBiometric) {
    //   LocalAuthentication.authenticateAsync()
    //     .then(async () => await BiometricProtectedPasscode.get())
    //     .then(pinFromSecureStore => {
    //       if (pinFromSecureStore !== null) {
    //         onPinInput(pinFromSecureStore)
    //       }
    //     })
    //     .catch(e => Logging.error(e)) // auto fallback to manual pin input
    // }
  }, [status, pin/*, isBiometric */])

  if (status === 'INIT' || status === 'IDLE') {
    return null
  }

  return (
    <SafeAreaView
      style={[
        tailwind('w-full h-full flex-col bg-white')
      ]}
    >
      <View
        style={{
          paddingTop: Platform.select({
            android: 20
          })
        }}
      >
        <TouchableOpacity
          testID='cancel_authorization' style={tailwind('bg-white p-4 border-b border-gray-200')}
          onPress={onCancel}
        >
          <Text
            style={tailwind('font-bold text-primary')}
          >{translate('components/UnlockWallet', 'CANCEL')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={tailwind('bg-white w-full flex-1 flex-col mt-8')}>
        <Text
          style={tailwind('text-center text-xl font-bold')}
        >{translate('screens/UnlockWallet', 'Enter passcode')}
        </Text>
        <View style={tailwind('p-4 px-8 text-sm text-center text-gray-500 mb-6')}>
          <Text
            style={tailwind('p-4 px-8 text-sm text-center text-gray-500 mb-2')}
          >{translate('screens/UnlockWallet', 'Please enter passcode to securely sign your transaction')}
          </Text>
          {
            transaction?.description !== undefined && (
              <Text
                style={tailwind('text-sm text-center text-gray-500')}
              >{transaction.description}
              </Text>
            )
          }
        </View>
        {/* TODO: switch authorization method here when biometric supported */}
        {
          status === 'PIN' && (
            <PinTextInput
              cellCount={PIN_LENGTH} onChange={(pin) => {
                onPinInput(pin)
              }} value={pin} testID='pin_authorize'
            />
          )
        }
        <Loading
          message={status === 'SIGNING' ? translate('screens/TransactionAuthorization', 'Signing...') : undefined}
        />
        {// upon retry: show remaining attempt allowed
          (isRetry && attemptsRemaining !== undefined && attemptsRemaining !== MAX_PASSCODE_ATTEMPT) ? (
            <Text testID='pin_attempt_error' style={tailwind('text-center text-error text-sm font-bold mt-5')}>
              {translate('screens/PinConfirmation', `${attemptsRemaining === 1 ? 'Last attempt or your wallet will be unlinked for your security'
                : 'Incorrect passcode. %{attemptsRemaining} attempts remaining'}`, { attemptsRemaining: `${attemptsRemaining}` })}
            </Text>
          ) : null
        }
        {// on first time: warn user there were accumulated error attempt counter
          (!isRetry && attemptsRemaining !== undefined && attemptsRemaining !== MAX_PASSCODE_ATTEMPT) ? (
            <Text testID='pin_attempt_warning' style={tailwind('text-center text-error text-sm font-bold mt-5')}>
              {translate('components/TransactionAuthorization', `${attemptsRemaining === 1 ? 'Last attempt or your wallet will be unlinked for your security'
                : '%{attemptsRemaining} attempts remaining'}`, { attemptsRemaining: `${attemptsRemaining}` })}
            </Text>
          ) : null
        }
      </View>
    </SafeAreaView>
  )
}

function Loading ({ message }: { message?: string }): JSX.Element | null {
  if (message === undefined) return null
  return (
    <View style={tailwind('flex-row justify-center p-2')}>
      <ActivityIndicator color='#FF00AF' />
      <Text style={tailwind('ml-2')}>{message}</Text>
    </View>
  )
}

async function execWithAutoRetries (promptPromise: () => Promise<any>, onAutoRetry: (attempts: number) => Promise<void>, retries: number = 0): Promise<any> {
  try {
    return await promptPromise()
  } catch (e) {
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
  if (Platform.OS !== 'web') {
    Alert.alert(
      translate('screens/PinConfirmation', 'Wallet Unlinked'),
      translate('screens/PinConfirmation', 'Your wallet was unlinked for your safety due to successive passcode failures. Please use recovery words to restore and set up your wallet again.'),
      [
        {
          text: translate('screens/PinConfirmation', 'Close'),
          style: 'destructive'
        }
      ]
    )
  }
}
