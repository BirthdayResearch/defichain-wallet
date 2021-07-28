import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Logging } from '../api'
import { View } from '../components'
import { WalletProvider } from '../contexts/WalletContext'
import { useWalletManagementContext, MAX_PASSCODE_ATTEMPT } from '../contexts/WalletManagementContext'
import { RootState } from '../store'
import { ocean } from '../store/ocean'
import { DfTxSigner, first, transactionQueue } from '../store/transaction'
import { AppNavigator } from './AppNavigator/AppNavigator'
import { UnlockWallet } from './AppNavigator/screens/UnlockWallet'
import { WalletNavigator } from './WalletNavigator/WalletNavigator'

const PASSCODE_LENGTH = 6

/**
 * Top Root Level Wallet State to control what screen to show
 */
export function RootNavigator (): JSX.Element {
  const walletManagement = useWalletManagementContext()
  const { wallets, setPasscodePromptInterface } = useWalletManagementContext()

  // store
  const dispatch = useDispatch()
  const transaction = useSelector((state: RootState) => first(state.transactionQueue))

  // state
  const [errCount, setErrCount] = useState(0)
  const [isPrompting, setIsPrompting] = useState(false)

  // proxied resolve/reject
  const promptResolve = useRef<(pin: string) => void>()
  const promptReject = useRef<(e: Error) => void>()

  const incrementError = useCallback(async () => {
    setErrCount(errCount + 1)
    await walletManagement.incrementPasscodeErrorCount()
  }, [errCount])
  const resetError = useCallback(async () => {
    setErrCount(0)
    await walletManagement.resetErrorCount()
  }, [errCount])

  useEffect(() => {
    // last available job will remained in this UI state until get dismissed
    if (transaction !== undefined) {
      let result: CTransactionSegWit | null // 3 types of result
      signTransaction(transaction, wallets[0].get(0), incrementError)
        .then(async signedTx => { result = signedTx }) // positive
        .catch(e => {
          if (e.message !== 'USER_CANCELED') result = null // negative
          // else result = undefined // neutral
        })
        .then(async () => {
          if (result === undefined) { // cancel
            setIsPrompting(false) // dismiss prompt UI
            dispatch(transactionQueue.actions.pop()) // remove job
          } else if (result === null) { // consecutive error
            await walletManagement.clearWallets()
          } else {
            setIsPrompting(false) // dismiss prompt UI
            dispatch(transactionQueue.actions.pop()) // remove job
            dispatch(ocean.actions.queueTransaction({ tx: result })) // push signed result for broadcasting
            await resetError()
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
          setIsPrompting(true)
        })
      }
    })
  }, [])

  useEffect(() => {
    walletManagement.errorCount().then(count => setErrCount(count)).catch(e => Logging.error(e))
  }, [])

  if (wallets.length === 0) {
    return <WalletNavigator />
  }

  const appContainerStyle: { height?: number } = {}
  if (isPrompting) {
    // TO BE IMPROVED
    // hackish method to hide <AppNavigator /> WITHOUT losing state, state must retained
    appContainerStyle.height = 0
  }

  return (
    <WalletProvider>
      <WalletContextPasscodePrompt
        isPrompting={isPrompting}
        errorCount={errCount}
        onPinInput={pin => {
          if (promptResolve.current !== undefined) {
            const resolve = promptResolve.current
            resolve(pin)
            promptResolve.current = undefined
            promptReject.current = undefined
          }
        }}
        onCancel={() => {
          if (promptReject.current !== undefined) {
            const reject = promptReject.current
            reject(new Error('USER_CANCELED'))
            promptResolve.current = undefined
            promptReject.current = undefined
          }
        }}
      />
      <View style={[tailwind('flex-1'), appContainerStyle]}>
        <AppNavigator />
      </View>
    </WalletProvider>
  )
}

function WalletContextPasscodePrompt ({ isPrompting, onPinInput, errorCount, onCancel }: {
  isPrompting: boolean
  onPinInput: (pin: string) => void
  errorCount: number
  onCancel: () => void
}): JSX.Element | null {
  /**
   * UI literally stuck on this page until either
   * 1. successfully resolve promise with valid pin (successful decryption)
   * 2. error count hit threshold, wallet wiped, will auto redirect to onboarding again
   */
  if (!isPrompting) return null

  /**
   * prompting , err = show prompt
   * not prompting, err = show prompt
   * prompting, no err = show prompt
   * not prompting, no error = show null
   */
  const attemptsRemaining = errorCount === 0 ? undefined : MAX_PASSCODE_ATTEMPT - errorCount
  return (
    <UnlockWallet
      onPinInput={onPinInput}
      pinLength={PASSCODE_LENGTH}
      attemptsRemaining={attemptsRemaining}
      onCancel={onCancel}
    />
  )
}

async function signTransaction (tx: DfTxSigner, account: WhaleWalletAccount, incrementError: () => Promise<void>, retries: number = 0): Promise<CTransactionSegWit> {
  try {
    return await tx.sign(account)
  } catch (e) {
    if (e.message === 'USER_CANCELED') throw e

    if (retries < MAX_PASSCODE_ATTEMPT) {
      await incrementError()
      return await signTransaction(tx, account, incrementError, retries + 1)
    }
    throw e
  }
}
