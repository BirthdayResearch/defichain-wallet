import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import React, { Dispatch, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Platform, SafeAreaView, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../api'
import { PasscodeAttemptCounter } from '../api/wallet'
import { Text, View } from '../components'
import { PinTextInput } from '../components/PinTextInput'
import { useEncryptedWalletUI, useWallet } from '../contexts/WalletContext'
import { useWalletPersistenceContext } from '../contexts/WalletPersistenceContext'
import { RootState } from '../store'
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
  const [pin, setPin] = useState<string>('')

  const onPinInput = useCallback((pin: string): void => {
    setPin(pin)
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
    setPin('')
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
    setPin('')
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - attempts)
    await PasscodeAttemptCounter.set(attempts)
    emitEvent('PIN')
  }, [attemptsRemaining])

  const onComplete = useCallback(async (dispatch: Dispatch<any>, tx: CTransactionSegWit) => {
    setPin('')
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
        .then(async signedTx => {
          result = signedTx
        }) // positive
        .catch(e => {
          // error type check
          if (e.message === 'invalid hash') result = null // negative, invalid passcode
          // else result = undefined // neutral
        })
        .then(async () => {
          // result handling, 3 cases
          if (result === undefined) {
            dispatch(transactionQueue.actions.pop())
          } else if (result === null) {
            await clearWallets()
            onUnlinkWallet()
          } else {
            await onComplete(dispatch, result)
          }
        })
        .catch(e => Logging.error(e))
        .finally(() => emitEvent('IDLE'))
    }
  }, [transaction, wallet, status])

  useEffect(() => {
    if (encryptionUI !== undefined) {
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
    }
    emitEvent('IDLE')
  }, [])

  if (status === 'INIT') return null

  return (
    <SafeAreaView
      style={[
        tailwind('w-full h-full flex-col bg-white'),
        status === 'IDLE' && tailwind('hidden')
      ]}
    >
      <View
        style={{
          paddingTop: Platform.select({
            android: 20
          })
        }}
      >
        <TouchableOpacity style={tailwind('bg-white p-4 border-b border-gray-200')} onPress={onCancel}>
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
        <Text
          style={tailwind('p-4 px-8 text-sm text-center text-gray-500 mb-6')}
        >{translate('screens/UnlockWallet', 'To proceed with your transaction, please enter your passcode')}
        </Text>
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
        {
          (attemptsRemaining !== undefined && attemptsRemaining !== MAX_PASSCODE_ATTEMPT) ? (
            <Text style={tailwind('text-center text-error text-sm font-bold mt-5')}>
              {translate('screens/PinConfirmation', `${attemptsRemaining === 1 ? 'Last attempt or your wallet will be unlinked for your security'
                : 'Incorrect passcode. %{attemptsRemaining} attempts remaining'}`, { attemptsRemaining: `${attemptsRemaining}` })}
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

function onUnlinkWallet (): void {
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
