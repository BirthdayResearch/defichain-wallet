import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { Transaction } from '@defichain/whale-api-client/dist/api/transactions'
import { getEnvironment } from '@environment'
import { RootState } from '@store'
import { firstTransactionSelector, ocean, OceanTransaction, TransactionStatusCode } from '@store/ocean'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { useSelector } from 'react-redux'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { TransactionDetail } from './TransactionDetail'
import { TransactionError } from './TransactionError'
import { getReleaseChannel } from '@api/releaseChannel'
import { useAppDispatch } from '@hooks/useAppDispatch'

const MAX_AUTO_RETRY = 1
const MAX_TIMEOUT = 300000
const INTERVAL_TIME = 5000

async function broadcastTransaction (tx: CTransactionSegWit, client: WhaleApiClient, retries: number = 0, logger: NativeLoggingProps): Promise<string> {
  try {
    return await client.rawtx.send({ hex: tx.toHex() })
  } catch (e) {
    logger.error(e)
    if (retries < MAX_AUTO_RETRY) {
      return await broadcastTransaction(tx, client, retries + 1, logger)
    }
    throw e
  }
}

async function waitForTxConfirmation (id: string, client: WhaleApiClient, logger: NativeLoggingProps): Promise<Transaction> {
  const initialTime = getEnvironment(getReleaseChannel()).debug ? 5000 : 30000
  let start = initialTime

  return await new Promise((resolve, reject) => {
    let intervalID: NodeJS.Timeout
    const callTransaction = (): void => {
      client.transactions.get(id).then((tx) => {
        if (intervalID !== undefined) {
          clearInterval(intervalID)
        }
        resolve(tx)
      }).catch((e) => {
        if (start >= MAX_TIMEOUT) {
          logger.error(e)
          if (intervalID !== undefined) {
            clearInterval(intervalID)
          }
          reject(e)
        }
      })
    }
    setTimeout(() => {
      callTransaction()
      intervalID = setInterval(() => {
        start += INTERVAL_TIME
        callTransaction()
      }, INTERVAL_TIME)
    }, initialTime)
  })
}

/**
 * @description - Global component to be used for async calls, network errors etc. This component is positioned above the bottom tab.
 *  Need to get the height of bottom tab via `useBottomTabBarHeight()` hook to be called on screen.
 * */
export function OceanInterface (): JSX.Element | null {
  const logger = useLogger()
  const dispatch = useAppDispatch()
  const client = useWhaleApiClient()
  const {
    wallet,
    address
  } = useWalletContext()
  const { getTransactionUrl } = useDeFiScanContext()

  // store
  const {
    height,
    err: e
  } = useSelector((state: RootState) => state.ocean)
  const transaction = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const slideAnim = useRef(new Animated.Value(0)).current
  // state
  const [tx, setTx] = useState<OceanTransaction | undefined>(transaction)
  const [err, setError] = useState<string | undefined>(e?.message)
  const [txUrl, setTxUrl] = useState<string | undefined>()

  const dismissDrawer = useCallback(() => {
    setTx(undefined)
    setError(undefined)
    slideAnim.setValue(0)
  }, [slideAnim])

  useEffect(() => {
    // last available job will remained in this UI state until get dismissed
    if (transaction !== undefined) {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: false
      }).start()
      setTx({
        ...transaction,
        broadcasted: false,
        title: translate('screens/OceanInterface', 'Preparing broadcast')
      })
      broadcastTransaction(transaction.tx, client, 0, logger)
        .then(async () => {
          try {
            setTxUrl(getTransactionUrl(transaction.tx.txId, transaction.tx.toHex()))
          } catch (e) {
            logger.error(e)
          }
          setTx({
            ...transaction,
            title: translate('screens/OceanInterface', 'Waiting for transaction')
          })
          if (transaction.onBroadcast !== undefined) {
            transaction.onBroadcast()
          }
          let title
          let oceanStatusCode: TransactionStatusCode
          try {
            await waitForTxConfirmation(transaction.tx.txId, client, logger)
            title = 'Transaction confirmed'
            oceanStatusCode = TransactionStatusCode.success
          } catch (e) {
            logger.error(e)
            title = 'Sent (Pending confirmation)'
            oceanStatusCode = TransactionStatusCode.pending
          }
          setTx({
            ...transaction,
            broadcasted: true,
            title: translate('screens/OceanInterface', title),
            oceanStatusCode
          })
          if (transaction.onConfirmation !== undefined) {
            transaction.onConfirmation()
          }
        })
        .catch((e: Error) => {
          const errMsg = `${e.message}. Txid: ${transaction.tx.txId}`
          setError(errMsg)
          logger.error(e)
          if (transaction.onError !== undefined) {
            transaction.onError()
          }
        })
        .finally(() => {
          dispatch(ocean.actions.popTransaction())
        }) // remove the job as soon as completion
    }
  }, [transaction, wallet, address])

  // If there are any explicit errors to be displayed
  useEffect(() => {
    if (e !== undefined) {
      setError(e.message)
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: false
      }).start()
    }
  }, [e])

  if (tx === undefined && err === undefined) {
    return null
  }

  return (
    <Animated.View
      style={[tailwind('px-5 py-3 flex-row absolute w-full items-center z-10'), {
        bottom: slideAnim,
        minHeight: 75
      }]}
    >
      {
        err !== undefined
          ? (
            <TransactionError
              errMsg={err}
              onClose={dismissDrawer}
            />
          )
          : (
            tx !== undefined && (
              <TransactionDetail
                broadcasted={tx.broadcasted}
                onClose={dismissDrawer}
                title={tx.title}
                oceanStatusCode={tx.oceanStatusCode}
                txUrl={txUrl}
                txid={tx.tx.txId}
              />
            )
          )
      }
    </Animated.View>
  )
}
