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
import { translate } from '../translations'
import { AuthorizationInterface } from './AppNavigator/screens/AuthorizationInterface'

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
  const [spinnerMessage, setSpinnerMessage] = useState<string>()
  // setting this to default true (require pin callback setup), cause wallet require unlock upon this component reconstruct
  const [awaitingPromise, setAwaitingPromise] = useState(false) // waiting whole passphrase promise to be resolve
  const [awaitingPin, setAwaitingPin] = useState(false) // waiting pin input

  // proxied resolve/reject
  const promptResolve = useRef<(pin: string) => void>()
  const promptReject = useRef<(e: Error) => void>()

  // update persistent + resolve state
  const onRetry = useCallback(async (attempts: number) => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - attempts)
    setAwaitingPin(true)
    await walletManagement.incrementPasscodeErrorCount()
  }, [attemptsRemaining])
  const onSuccess = useCallback(async () => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT)
    await walletManagement.resetErrorCount()
  }, [])

  useEffect(() => {
    if (!awaitingPromise || awaitingPin) setSpinnerMessage(undefined)
    else setSpinnerMessage(translate('components/EncryptedWallet', 'Unlocking wallet...'))
  }, [awaitingPromise, awaitingPin])

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
          setAwaitingPromise(false) // dismiss prompt UI
          if (result === undefined) {
            // case: cancel
            dispatch(transactionQueue.actions.pop()) // remove job
          } else if (result === null) {
            // case: consecutive error
            await walletManagement.clearWallets()
          } else {
            // case: success
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
      <AuthorizationInterface
        isPrompting={awaitingPin}
        spinnerMessage={spinnerMessage}
        pinLength={PASSCODE_LENGTH}
        attemptsRemaining={attemptsRemaining >= MAX_PASSCODE_ATTEMPT ? undefined : attemptsRemaining}
        onPinInput={pin => {
          setAwaitingPin(false)
          if (promptResolve.current !== undefined) {
            const resolve = promptResolve.current
            setTimeout(() => {
              resolve(pin)
              promptResolve.current = undefined
              promptReject.current = undefined
            }, 50)
          }
        }}
        onCancel={() => {
          setAwaitingPin(false)
          if (promptReject.current !== undefined) {
            const reject = promptReject.current
            setTimeout(() => {
              reject(new Error('USER_CANCELED'))
              promptResolve.current = undefined
              promptReject.current = undefined
            }, 50)
          }
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
