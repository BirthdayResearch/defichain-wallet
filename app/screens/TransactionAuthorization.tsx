import React, { useState, useEffect, useCallback, Dispatch, useRef } from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { tailwind } from '../tailwind'
import { Text, View } from '../components'
import { PinInput } from '../components/PinInput'
import { translate } from '../translations'
import { useEncryptedWallet, useWallet } from '../contexts/WalletContext'
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

type Status = 'INIT' | 'IDLE' | 'PIN' | 'SIGNING'
/**
 * The main UI page transaction signing logic interact with encrypted wallet context
 */
export function TransactionAuthorization (): JSX.Element | null {
  // context
  const { clearWallets } = useWalletPersistenceContext()
  const wallet = useWallet()
  const encryptionUI = useEncryptedWallet()

  // store
  const dispatch = useDispatch()
  const transaction = useSelector((state: RootState) => first(state.transactionQueue))

  // computed state
  const [status, emitEvent] = useState<Status>('INIT')
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(MAX_PASSCODE_ATTEMPT)

  const resolvePrompt = useRef<(pass: string) => void>()
  const rejectPrompt = useRef<(e: Error) => void>()

  const onPinInput = (pin: string): void => {
    if (pin.length === PIN_LENGTH) {
      if (resolvePrompt.current !== undefined) {
        const resolve = resolvePrompt.current
        emitEvent('SIGNING')
        setTimeout(() => {
          resolve(pin)
          // remove proxied promised, allow next prompt() call
          resolvePrompt.current = undefined
          rejectPrompt.current = undefined
        }, 50)
      }
    }
  }

  const onCancel = (): void => {
    emitEvent('IDLE')
    if (rejectPrompt.current !== undefined) {
      const reject = rejectPrompt.current
      setTimeout(() => {
        reject(new Error('USER_CANCELED'))
        // remove proxied promised, allow next prompt() call
        resolvePrompt.current = undefined
        rejectPrompt.current = undefined
      }, 50)
    }
  }

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
    // last available job will remained in this UI state until get dismissed
    if (transaction !== undefined) {
      let result: CTransactionSegWit | null | undefined // 3 types of result

      signTransaction(transaction, wallet.get(0), onRetry)
        .then(async signedTx => { result = signedTx }) // positive
        .catch(e => {
          if (e.message !== 'USER_CANCELED') result = null // negative
          // else result = undefined // neutral
        })
        .then(async () => {
          if (result === undefined) dispatch(transactionQueue.actions.pop())
          else if (result === null) await clearWallets()
          else await onComplete(dispatch, result)
          emitEvent('IDLE')
        }).catch(e => Logging.error(e))
    }
  }, [transaction, wallet, status, emitEvent])

  useEffect(() => {
    encryptionUI.provide({
      prompt: async () => await new Promise<string>((resolve, reject) => {
        resolvePrompt.current = resolve
        rejectPrompt.current = reject
        emitEvent('PIN')
      })
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
