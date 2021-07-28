import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Logging } from '../api'
import { View } from '../components'
import { useWalletManagementContext, MAX_PASSCODE_ATTEMPT, PASSCODE_LENGTH } from '../contexts/WalletManagementContext'
import { RootState } from '../store'
import { ocean } from '../store/ocean'
import { DfTxSigner, first, transactionQueue } from '../store/transaction'
import { UnlockWalletInterface } from './AppNavigator/screens/UnlockWallet'

/**
 * Side by side with AppNavigator at root level
 */
export function EncryptedWallet (): JSX.Element {
  const walletManagement = useWalletManagementContext()
  const { wallets, setPasscodePromptInterface } = useWalletManagementContext()

  // store
  const dispatch = useDispatch()
  const transaction = useSelector((state: RootState) => first(state.transactionQueue))

  // state
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(MAX_PASSCODE_ATTEMPT)
  // setting this to default true (require pin callback setup), cause wallet require unlock upon this component reconstruct
  const [awaitingPromise, setAwaitingPromise] = useState(false) // waiting whole passphrase promise to be resolve
  const [awaitingPin, setAwaitingPin] = useState(false) // waiting pin input

  // proxied resolve/reject
  const promptResolve = useRef<(pin: string) => void>()
  const promptReject = useRef<(e: Error) => void>()

  // update persistent + resolve state
  const onRetry = useCallback(async (attempts: number) => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - attempts)
    setAwaitingPin(true) // ensure next retry can update state of pin input
    await walletManagement.incrementPasscodeErrorCount()
  }, [attemptsRemaining, awaitingPin])
  const onSuccess = useCallback(async () => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT)
    await walletManagement.resetErrorCount()
  }, [attemptsRemaining])

  // consume pending to sign TransactionQueue from store
  useEffect(() => {
    // last available job will remained in this UI state until get dismissed
    if (transaction !== undefined) {
      let result: CTransactionSegWit | null // 3 types of result
      signTransaction(transaction, wallets[0].get(0), onRetry)
        .then(async signedTx => { result = signedTx }) // positive
        .catch(e => {
          if (e.message !== 'USER_CANCELED') result = null // negative
          // else result = undefined // neutral
        })
        .then(async () => {
          if (result === undefined) {
            // case: cancel
            setAwaitingPromise(false) // dismiss prompt UI
            dispatch(transactionQueue.actions.pop()) // remove job
          } else if (result === null) {
            // case: consecutive error
            await walletManagement.clearWallets()
          } else {
            // case: success
            setAwaitingPromise(false) // dismiss prompt UI
            dispatch(transactionQueue.actions.pop()) // remove job
            dispatch(ocean.actions.queueTransaction({ tx: result })) // push signed result for broadcasting
            await onSuccess()
          }
        }).catch(e => Logging.error(e))
    }
  }, [transaction, wallets])

  // setup interface for encryptedProvider::promptPassphrase call
  useEffect(() => {
    setPasscodePromptInterface({
      prompt: async () => {
        return await new Promise<string>((resolve, reject) => {
          promptResolve.current = resolve
          promptReject.current = reject
          setAwaitingPromise(true)
          setAwaitingPin(true)
        })
      }
    })

    // load accumulated attempts failure from persistent storage ONCE
    walletManagement.errorCount()
      .then(count => setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - count))
      .catch(e => Logging.error(e))
  }, [])

  const viewHeight: { height?: number } = {}
  if (!awaitingPromise && !awaitingPin) {
    // TO BE IMPROVED
    // hackish method to hide prompt UI WITHOUT losing state, state MUST be RETAINED (proxied promise resolver etc)
    // across multiple retries (to prevent flickers)
    viewHeight.height = 0
  }

  return (
    <View style={[tailwind('h-full'), viewHeight]}>
      <UnlockWalletInterface
        isPrompting={awaitingPromise || awaitingPin}
        pinLength={PASSCODE_LENGTH}
        attemptsRemaining={attemptsRemaining >= MAX_PASSCODE_ATTEMPT ? undefined : attemptsRemaining}
        onPinInput={pin => {
          if (promptResolve.current !== undefined) {
            const resolve = promptResolve.current
            resolve(pin)
            promptResolve.current = undefined
            promptReject.current = undefined
          }
          setAwaitingPin(false)
        }}
        onCancel={() => {
          if (promptReject.current !== undefined) {
            const reject = promptReject.current
            reject(new Error('USER_CANCELED'))
            promptResolve.current = undefined
            promptReject.current = undefined
          }
          setAwaitingPin(false)
        }}
      />
    </View>
  )
}

async function signTransaction (tx: DfTxSigner, account: WhaleWalletAccount, onAutoRetry: (attempts: number) => Promise<void>, retries: number = 0): Promise<CTransactionSegWit> {
  try {
    return await tx.sign(account)
  } catch (e) {
    if (e.message === 'USER_CANCELED') throw e

    if (retries < MAX_PASSCODE_ATTEMPT) {
      await onAutoRetry(retries + 1)
      return await signTransaction(tx, account, onAutoRetry, retries + 1)
    }
    throw e
  }
}
