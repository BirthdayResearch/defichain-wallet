import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { JellyfishWallet, WalletHdNodeProvider } from '@defichain/jellyfish-wallet'
import { MnemonicHdNode } from '@defichain/jellyfish-wallet-mnemonic'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '@api'
import {
  initJellyfishWallet,
  MnemonicEncrypted,
  MnemonicUnprotected,
  PasscodeAttemptCounter,
  WalletType
} from '@api/wallet'
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
} from '@screens/TransactionAuthorization/api/transaction_signer'
import {
  CANCELED_ERROR,
  DEFAULT_MESSAGES,
  INVALID_HASH,
  MAX_PASSCODE_ATTEMPT,
  PASSCODE_LENGTH,
  PromptPromiseI,
  SUCCESS_DISPLAY_TIMEOUT_IN_MS,
  TransactionStatus,
  USER_CANCELED
} from '@screens/TransactionAuthorization/api/transaction_types'
import { BottomSheetBackgroundProps, BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet'
import { tailwind } from '@tailwind'
import { View } from '@components'
import { Platform } from 'react-native'
import { useThemeContext } from '@contexts/ThemeProvider'

/**
 * @description - Passcode prompt promise that resolves the pin to the wallet
 * */
let PROMPT_PIN_PROMISE: PromptPromiseI | undefined

/**
 * @description - Main component to handle all authorizations for Transactions. All transaction validation logic happens here.
 * This file is imported in RootNavigator.
 * @see - PasscodePrompt.tsx for UI of Prompt
 */
export function TransactionAuthorization (): JSX.Element | null {
  const { data: providerData } = useWalletNodeContext()
  const { clearWallets } = useWalletPersistenceContext()
  const { network } = useNetworkContext()
  const whaleApiClient = useWhaleApiClient()
  const dispatch = useDispatch()
  const transaction = useSelector((state: RootState) => first(state.transactionQueue))
  const authentication = useSelector((state: RootState) => state.authentication.authentication)

  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(TransactionStatus.INIT)
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(MAX_PASSCODE_ATTEMPT)
  const [pin, setPin] = useState<string>('')
  const [isRetry, setIsRetry] = useState(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const { dismiss } = useBottomSheetModal()
  const modalName = 'PasscodePromptModal'
  const getSnapPoints = (): string[] => {
    if (Platform.OS === 'ios') {
      return ['65%'] // ios measures space without keyboard
    } else if (Platform.OS === 'android') {
      return ['50%'] // android measure space by including keyboard
    }
    return []
  }
  const { isLight } = useThemeContext()

  /**
   * This is one of the most important state of this component.
   * 1. We initialize a JellyFishWallet and attach a promise to it (https://github.com/DeFiCh/jellyfish/blob/fe270b737705ad33242a9ec3f8896b2f8f5052c8/packages/jellyfish-wallet-encrypted/src/hd_node.ts#L122)
   * 2. We attach the PROMPT_PIN_PROMISE from this component that will resolve the passcode to the JellyFish wallet
   * 3. It acts as a "general" promise that gets resolved once passcode input is complete
   * 4. Take note on the word "complete". Meaning, it's not yet validated/verified that it's the actual passcode.
   */
  const [wallet, setWallet] = useState<JellyfishWallet<WhaleWalletAccount, MnemonicHdNode>>()

  // messages
  const [message, setMessage] = useState(DEFAULT_MESSAGES.message)
  const [loadingMessage, setLoadingMessage] = useState(DEFAULT_MESSAGES.loadingMessage)

  const closeModal = useCallback(() => {
    dismiss(modalName)
  }, [])

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  // generic callbacks
  const onPinInput = (inputPin: string): void => {
    if (inputPin.length === PASSCODE_LENGTH && PROMPT_PIN_PROMISE !== undefined) {
      const resolve = PROMPT_PIN_PROMISE.resolve
      setTimeout(() => {
        resolve(inputPin)
        // remove proxied promised, allow next prompt() call
        PROMPT_PIN_PROMISE = undefined
      }, 50)
      setTransactionStatus(TransactionStatus.SIGNING)
    }
    setPin(inputPin)
  }

  const onCancel = (): void => {
    if (PROMPT_PIN_PROMISE !== undefined) {
      PROMPT_PIN_PROMISE.reject(new Error(USER_CANCELED))
      // remove proxied promised, allow next prompt() call
      PROMPT_PIN_PROMISE = undefined
    } else if (transactionStatus === TransactionStatus.AUTHORIZED) {
      PROMPT_PIN_PROMISE = undefined
      transaction === undefined
        ? dispatch(authenticationStore.actions.dismiss())
        : dispatch(transactionQueue.actions.pop())
      onTaskCompletion()
    }

    setTimeout(() => {
      // adding arbitrary timeout to fix modal not closing in Android
      closeModal()
    }, 300)
  }

  const onRetry = async (attempts: number): Promise<void> => {
    setPin('')
    setIsRetry(true)
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - attempts)
    await PasscodeAttemptCounter.set(attempts)
  }

  const onPrompt = async (): Promise<string> => {
    if (PROMPT_PIN_PROMISE !== undefined) {
      throw new Error('prompt UI occupied')
    }
    return await new Promise<string>((resolve, reject) => {
      // passphrase prompt is meant for authorizing single transaction regardless
      // caller should not prompt for next transaction before one is completed
      // proxy the promise, wait for user input
      PROMPT_PIN_PROMISE = {
        resolve,
        reject
      }
      // setPin('') // do not reset, keep pin cached until onTaskCompletion
      setTransactionStatus(TransactionStatus.PIN)
    })
  }

  const resetPasscodeCounter = async (): Promise<void> => {
    setAttemptsRemaining(MAX_PASSCODE_ATTEMPT)
    await PasscodeAttemptCounter.set(0)
  }

  const onTaskCompletion = (): void => {
    closeModal()
    setPin('')
    setIsRetry(false)
    setMessage(DEFAULT_MESSAGES.message)
    setLoadingMessage(DEFAULT_MESSAGES.loadingMessage)
    setTransactionStatus(TransactionStatus.IDLE) // very last step, open up for next task
  }

  const setupNewWallet = (passcodePromptPromise: () => Promise<string>): void => {
    let provider: WalletHdNodeProvider<MnemonicHdNode>
    if (providerData.type === WalletType.MNEMONIC_UNPROTECTED) {
      provider = MnemonicUnprotected.initProvider(providerData, network)
    } else if (providerData.type === WalletType.MNEMONIC_ENCRYPTED) {
      provider = MnemonicEncrypted.initProvider(providerData, network, { prompt: passcodePromptPromise })
    } else {
      throw new Error('Missing wallet provider data handler')
    }
    setWallet(initJellyfishWallet(provider, network, whaleApiClient))
  }

  const onPinSuccess = async (onBroadcast: any, signedTx: CTransactionSegWit, submitButtonLabel?: string): Promise<void> => {
    setTransactionStatus(TransactionStatus.AUTHORIZED)
    await resetPasscodeCounter()
    dispatch(ocean.actions.queueTransaction({
      tx: signedTx,
      onBroadcast,
      submitButtonLabel
    })) // push signed result for broadcasting
  }

  // mandatory UI initialization
  useEffect(() => {
    setupNewWallet(onPrompt)
    PasscodeAttemptCounter.get()
      .then(counter => {
        setAttemptsRemaining(MAX_PASSCODE_ATTEMPT - counter)
        setTransactionStatus(TransactionStatus.IDLE)
      })
      .catch(error => {
        Logging.error(error)
        throw error
      })
  }, [providerData, network, whaleApiClient])

  /**
   * @description This is where the magic happens. It serves two types of transactions
   * 1. Wallet Transactions (e.g, Send, Add Liquidity, Pool Swap etc.)
   * 2. Non-wallet transactions (e.g, Reveal recovery words, change app passcode)
   * If you're curious where the passcode validation is triggered, see - https://github.com/DeFiCh/jellyfish/blob/fe270b737705ad33242a9ec3f8896b2f8f5052c8/packages/jellyfish-wallet-encrypted/src/hd_node.ts#L87
   * */
  useEffect(() => {
    if (transactionStatus !== TransactionStatus.IDLE) {
      // wait for prompt UI is ready again
      return
    }

    if (attemptsRemaining === 0) {
      return
    }

    const retries = MAX_PASSCODE_ATTEMPT - attemptsRemaining
    // Wallet Transactions
    if (transaction !== undefined && // any tx queued
      wallet !== undefined // just in case any data stuck in store
    ) {
      setTransactionStatus(TransactionStatus.BLOCK) // prevent any re-render trigger (between IDLE and PIN)
      signTransaction(transaction, wallet.get(0), onRetry, retries)
        .then(async signedTx => {
          // case 1: success
          await onPinSuccess(transaction.onBroadcast, signedTx, transaction.submitButtonLabel)
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
      // Non-wallet transactions
      setTransactionStatus(TransactionStatus.BLOCK) // prevent any re-render trigger (between IDLE and PIN)
      setMessage(authentication.message)
      setLoadingMessage(authentication.loading)

      authenticateFor(onPrompt, authentication, onRetry, retries)
        .then(async () => {
          // case 1: success
          setTransactionStatus(TransactionStatus.AUTHORIZED)
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
  }, [transaction, wallet, transactionStatus, authentication, attemptsRemaining])

  // auto resolve with cached pin if any
  useEffect(() => {
    if (transactionStatus === TransactionStatus.PIN && pin.length === PASSCODE_LENGTH) {
      onPinInput(pin)
    }
  }, [transactionStatus, pin])

  /**
   * @description When the transaction has been TransactionStatus.AUTHORIZED, show the completion screen after SUCCESS_DISPLAY_TIMEOUT_IN_MS
   * */
  useEffect(() => {
    if (transactionStatus === TransactionStatus.AUTHORIZED) {
      setTimeout(() => {
        transaction === undefined
          ? dispatch(authenticationStore.actions.dismiss())
          : dispatch(transactionQueue.actions.pop())
        PROMPT_PIN_PROMISE = undefined
        onTaskCompletion()
      }, SUCCESS_DISPLAY_TIMEOUT_IN_MS)
    }
  }, [transactionStatus])

  useEffect(() => {
    if (![TransactionStatus.INIT, TransactionStatus.IDLE, TransactionStatus.BLOCK].includes(transactionStatus)) {
      openModal()
    }
  }, [transactionStatus])

  if ([TransactionStatus.INIT, TransactionStatus.IDLE, TransactionStatus.BLOCK].includes(transactionStatus)) {
    return null
  }

  return (
    <>
      {Platform.OS === 'web' &&
        <PasscodePrompt
          onCancel={onCancel}
          message={translate('screens/UnlockWallet', message)}
          transaction={transaction}
          status={transactionStatus}
          pinLength={PASSCODE_LENGTH}
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
        />}
      {Platform.OS !== 'web' &&
        <BottomSheetModal
          name={modalName}
          ref={bottomSheetModalRef}
          snapPoints={getSnapPoints()}
          backdropComponent={(backdropProps: BottomSheetBackgroundProps) => (
            <View {...backdropProps} style={[backdropProps.style, tailwind('bg-black bg-opacity-60')]} />
          )}
          backgroundComponent={(backgroundProps: BottomSheetBackgroundProps) => (
            <View {...backgroundProps} style={[backgroundProps.style, tailwind(`${isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} border-t rounded`)]} />
          )}
          onChange={(index) => {
            if (index === -1) {
              onCancel()
            }
          }}
          enablePanDownToClose={transactionStatus !== TransactionStatus.BLOCK && transactionStatus !== TransactionStatus.SIGNING}
        >
          <PasscodePrompt
            onCancel={onCancel}
            message={translate('screens/UnlockWallet', message)}
            transaction={transaction}
            status={transactionStatus}
            pinLength={PASSCODE_LENGTH}
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
        </BottomSheetModal>}
    </>
  )
}
