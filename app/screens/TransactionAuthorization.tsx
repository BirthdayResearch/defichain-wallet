import React, { useState, useEffect, useCallback, Dispatch } from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { Text, View } from '../components'
import { PinInput } from '../components/PinInput'
import { translate } from '../translations'
import { useEncryptedWalletUI, useWallet } from '../contexts/WalletContext'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { DfTxSigner, first, transactionQueue } from '../store/transaction_queue'
import { useWalletPersistenceContext } from '../contexts/WalletPersistenceContext'
import { PasscodeAttemptCounter } from '../api/wallet/passcode_attempt'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { ocean } from '../store/ocean'
import { Logging } from '../api'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'

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

type Status = 'INIT' | 'IDLE' | 'PIN' | 'SIGNING'
/**
 * The main UI page transaction signing logic interact with encrypted wallet context
 */
export function TransactionAuthorization (): JSX.Element | null {
  // context
  const { clearWallets } = useWalletPersistenceContext()
  const wallet = useWallet()
  const encryptionUI = useEncryptedWalletUI()

  // store
  const dispatch = useDispatch()
  const transaction = useSelector((state: RootState) => first(state.transactionQueue))

  // computed state
  const [status, emitEvent] = useState<Status>('INIT')
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(MAX_PASSCODE_ATTEMPT)

  const onPinInput = useCallback((pin: string): void => {
    if (pin.length === PIN_LENGTH && PASSPHRASE_PROMISE_PROXY !== undefined) {
      const resolve = PASSPHRASE_PROMISE_PROXY.resolve
      emitEvent('SIGNING')
      setTimeout(() => {
        resolve(pin)
        // remove proxied promised, allow next prompt() call
        PASSPHRASE_PROMISE_PROXY = undefined
      }, 50)
    }
  }, [PASSPHRASE_PROMISE_PROXY, PASSPHRASE_PROMISE_PROXY?.resolve])

  const onCancel = useCallback((): void => {
    emitEvent('IDLE')
    if (PASSPHRASE_PROMISE_PROXY !== undefined) {
      const reject = PASSPHRASE_PROMISE_PROXY.reject
      setTimeout(() => {
        reject(new Error('USER_CANCELED'))
        // remove proxied promised, allow next prompt() call
        PASSPHRASE_PROMISE_PROXY = undefined
      }, 50)
    }
  }, [PASSPHRASE_PROMISE_PROXY, PASSPHRASE_PROMISE_PROXY?.reject])

  const onRetry = useCallback(async (attempts: number) => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - attempts)
    await PasscodeAttemptCounter.set(attempts)
    emitEvent('PIN')
  }, [attemptsRemaining])

  const onComplete = useCallback(async (dispatch: Dispatch<any>, tx: CTransactionSegWit) => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT)
    await PasscodeAttemptCounter.set(0)

    dispatch(transactionQueue.actions.pop()) // remove job
    dispatch(ocean.actions.queueTransaction({ tx })) // push signed result for broadcasting
  }, [])

  // consume pending to sign TransactionQueue from store
  useEffect(() => {
    if (status === 'IDLE' && // wait for prompt UI is ready again
      transaction !== undefined // any tx queued
    ) {
      let result: CTransactionSegWit | null | undefined

      signTransaction(transaction, wallet.get(0), onRetry)
        .then(async signedTx => { result = signedTx }) // positive
        .catch(e => {
          // error type check
          if (e.message === 'invalid hash') result = null // negative, invalid passcode
          // else result = undefined // neutral
        })
        .then(async () => {
          // result handling, 3 cases
          if (result === undefined) dispatch(transactionQueue.actions.pop())
          else if (result === null) await clearWallets()
          else await onComplete(dispatch, result)
        })
        .catch(e => Logging.error(e))
        .finally(() => emitEvent('IDLE'))
    }
  }, [transaction, wallet, status])

  useEffect(() => {
    encryptionUI.provide({
      prompt: async () => {
        return await new Promise<string>((resolve, reject) => {
          // passphrase prompt is meant for authorizing single transaction regardless
          // caller should not prompt for next transaction before one is completed
          if (status !== 'INIT' && status !== 'IDLE') throw Error('Signing in progress')

          // wait for user input
          PASSPHRASE_PROMISE_PROXY = {
            resolve, reject
          }
          emitEvent('PIN')
        })
      }
    })
    emitEvent('IDLE')
  }, [])

  if (status === 'INIT') return null

  // hide/dismiss UI when not needed
  const viewHeight: { height?: number } = {}
  if (status === 'IDLE') {
    viewHeight.height = 0
  }

  return (
    <View style={[tailwind('w-full h-full flex-col'), viewHeight]}>
      <TouchableOpacity style={tailwind('bg-white p-4')} onPress={onCancel}>
        <Text
          style={tailwind('font-bold text-primary')}
        >{translate('components/UnlockWallet', 'CANCEL')}
        </Text>
      </TouchableOpacity>
      <View style={tailwind('bg-white w-full flex-1 flex-col justify-center border-t border-gray-200')}>
        <Text style={tailwind('text-center text-lg font-bold')}>{translate('screens/UnlockWallet', 'Enter passcode')}</Text>
        <Text style={tailwind('pt-2 pb-4 text-center text-gray-500')}>{translate('screens/UnlockWallet', 'For transaction signing purpose')}</Text>
        {/* TODO: switch authorization method here when biometric supported */}
        <PassphraseInput
          isPrompting={status === 'PIN'}
          disabled={status === 'SIGNING'}
          pinLength={PIN_LENGTH}
          onPinInput={onPinInput}
        />
        <Loading message={status === 'SIGNING' ? translate('screens/TransactionAuthorization', 'Signing...') : undefined} />
        {
          (attemptsRemaining !== undefined && attemptsRemaining !== MAX_PASSCODE_ATTEMPT) ? (
            <Text style={tailwind('text-center text-red-500 font-bold')}>
              {translate('screens/PinConfirmation', 'Wrong passcode. %{attemptsRemaining} tries remaining', { attemptsRemaining: `${attemptsRemaining}` })}
            </Text>
          ) : null
        }
      </View>
    </View>
  )
}

function PassphraseInput ({ isPrompting, pinLength, onPinInput, disabled }: {
  isPrompting: boolean
  pinLength: 4 | 6
  onPinInput: (pin: string) => void
  disabled?: boolean
}): JSX.Element | null {
  if (!isPrompting) {
    return null
  }

  return (
    <PinInput length={pinLength} onChange={onPinInput} disabled={disabled} />
  )
}

function Loading ({ message }: { message?: string }): JSX.Element | null {
  if (message === undefined) return null
  return (
    <View style={tailwind('flex-row justify-center p-2')}>
      <ActivityIndicator />
      <Text style={tailwind('ml-2')}>{message}</Text>
    </View>
  )
}

async function signTransaction (tx: DfTxSigner, account: WhaleWalletAccount, onAutoRetry: (attempts: number) => Promise<void>, retries: number = 0): Promise<CTransactionSegWit> {
  try {
    return await tx.sign(account)
  } catch (e) {
    if (e.message === 'USER_CANCELED') throw e
    if (++retries < MAX_PASSCODE_ATTEMPT) {
      await onAutoRetry(retries)
      return await signTransaction(tx, account, onAutoRetry, retries)
    }
    throw e
  }
}
