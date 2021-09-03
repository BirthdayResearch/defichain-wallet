import { Logging } from '@api'
import { useDeFiScanContext } from '@contexts/DeFiScanContext'
import { useThemeContext } from '@contexts/ThemeProvider'
import { useWalletContext } from '@contexts/WalletContext'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { Transaction } from '@defichain/whale-api-client/dist/api/transactions'
import { fetchTokens } from '@hooks/wallet/TokensAPI'
import { RootState } from '@store'
import { firstTransactionSelector, ocean, OceanTransaction } from '@store/ocean'
import { txidNotification } from '@store/transaction_notification'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import React, { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Linking, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { ThemedActivityIndicator, ThemedIcon, ThemedText } from '../themed'

const MAX_AUTO_RETRY = 1

async function gotoExplorer (txUrl: string): Promise<void> {
  // TODO(thedoublejay) explorer URL
  // TODO (future improvement): this page should support in mempool, to be confirm
  const supported = await Linking.canOpenURL(txUrl)
  if (supported) {
    await Linking.openURL(txUrl)
  }
}

async function broadcastTransaction (tx: CTransactionSegWit, client: WhaleApiClient, retries: number = 0): Promise<string> {
  try {
    return await client.rawtx.send({ hex: tx.toHex() })
  } catch (e) {
    Logging.error(e)
    if (retries < MAX_AUTO_RETRY) {
      return await broadcastTransaction(tx, client, retries + 1)
    }
    throw e
  }
}

async function waitForTxConfirmation (id: string, dispatch: Dispatch<any>): Promise<Transaction> {
  const TIMEOUT = 30000
  return await new Promise((resolve, reject) => {
    dispatch(txidNotification.actions.subscribe({
      txid: id,
      cb: async (tx: Transaction) => resolve(tx)
    }))
    setTimeout(() => {
      reject(new Error())
    }, TIMEOUT)
  })
}

/**
 * @description - Global component to be used for async calls, network errors etc. This component is positioned above the bottom tab.
 *  Need to get the height of bottom tab via `useBottomTabBarHeight()` hook to be called on screen.
 * */
export function OceanInterface (): JSX.Element | null {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const { wallet, address } = useWalletContext()
  const { getTransactionUrl } = useDeFiScanContext()
  const { isLight } = useThemeContext()

  // store
  const { height, err: e } = useSelector((state: RootState) => state.ocean)
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
      Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: false }).start()
      setTx({
        ...transaction,
        broadcasted: false
      })
      broadcastTransaction(transaction.tx, client)
        .then(async () => {
          try {
            setTxUrl(getTransactionUrl(transaction.tx.txId, transaction.tx.toHex()))
          } catch (e) {
            Logging.error(e)
          }
          setTx({
            ...transaction,
            title: translate('screens/OceanInterface', 'Waiting for confirmation')
          })
          if (transaction.postAction !== undefined) {
            transaction.postAction()
          }
          let title
          try {
            await waitForTxConfirmation(transaction.tx.txId, dispatch)
            title = 'Transaction Completed'
          } catch (e) {
            Logging.error(e)
            title = 'Sent but not confirmed'
          }
          setTx({
            ...transaction,
            broadcasted: true,
            title: translate('screens/OceanInterface', title)
          })
        })
        .catch((e: Error) => {
          const errMsg = `${e.message}. Txid: ${transaction.tx.txId}`
          setError(errMsg)
          Logging.error(e)
        })
        .finally(() => {
          dispatch(ocean.actions.popTransaction())
          fetchTokens(client, address, dispatch)
        }) // remove the job as soon as completion
    }
  }, [transaction, wallet, address])

  // If there are any explicit errors to be displayed
  useEffect(() => {
    if (e !== undefined) {
      setError(e.message)
      Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: false }).start()
    }
  }, [e])

  if (tx === undefined && err === undefined) {
    return null
  }

  const currentTheme = `${isLight ? 'bg-white border-t border-gray-200' : 'bg-gray-800 border-t border-gray-700'}`
  return (
    <Animated.View
      style={[tailwind('px-5 py-3 flex-row absolute w-full items-center z-10', currentTheme), {
        bottom: slideAnim,
        height: 75
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
                txUrl={txUrl}
                txid={tx.tx.txId}
              />
            )
          )
      }
    </Animated.View>
  )
}

function TransactionDetail ({
  broadcasted,
  txid,
  txUrl,
  onClose,
  title
}: { broadcasted: boolean, txid?: string, txUrl?: string, onClose: () => void, title?: string }): JSX.Element {
  title = title ?? translate('screens/OceanInterface', 'Broadcasting...')
  return (
    <>
      {
        !broadcasted
          ? <ThemedActivityIndicator />
          : (
            <ThemedIcon
              dark={tailwind('text-darksuccess-500')}
              iconType='MaterialIcons'
              light={tailwind('text-success-500')}
              name='check-circle'
              size={20}
            />
          )
      }

      <View style={tailwind('flex-auto mx-6 justify-center items-center text-center')}>
        <ThemedText
          style={tailwind('text-sm font-bold')}
        >
          {title}
        </ThemedText>

        {
          txid !== undefined && txUrl !== undefined &&
            <TransactionIDButton
              onPress={async () => await gotoExplorer(txUrl)}
              txid={txid}
            />
        }
      </View>

      {
        broadcasted && <TransactionCloseButton onPress={onClose} />
      }
    </>
  )
}

function TransactionError ({ errMsg, onClose }: { errMsg: string, onClose: () => void }): JSX.Element {
  const err = errorMessageMapping(errMsg)
  return (
    <>
      <ThemedIcon
        dark={tailwind('text-darkerror')}
        iconType='MaterialIcons'
        light={tailwind('text-error-500')}
        name='error'
        size={20}
      />

      <View style={tailwind('flex-auto mx-2 justify-center items-center text-center')}>
        <ThemedText
          style={tailwind('text-sm font-bold')}
        >
          {translate('screens/OceanInterface', `Error Code: ${err.code}`)}
        </ThemedText>

        <ThemedText
          ellipsizeMode='tail'
          numberOfLines={1}
          style={tailwind('text-sm font-bold')}
        >
          {translate('screens/OceanInterface', err.message)}
        </ThemedText>
      </View>

      <TransactionCloseButton onPress={onClose} />
    </>
  )
}

function TransactionIDButton ({ txid, onPress }: { txid: string, onPress?: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tailwind('flex-row p-1 items-center max-w-full')}
      testID='oceanNetwork_explorer'
    >
      <ThemedText
        dark={tailwind('text-darkprimary-500')}
        ellipsizeMode='tail'
        light={tailwind('text-primary-500')}
        numberOfLines={1}
        style={tailwind('text-sm font-medium mr-1')}
      >
        {txid}
      </ThemedText>

      <ThemedIcon
        dark={tailwind('text-darkprimary-500')}
        iconType='MaterialIcons'
        light={tailwind('text-primary-500')}
        name='open-in-new'
        size={18}
      />
    </TouchableOpacity>
  )
}

function TransactionCloseButton (props: { onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={tailwind('px-2 py-1 rounded border border-gray-300 rounded flex-row justify-center items-center')}
      testID='oceanInterface_close'
    >
      <ThemedText
        dark={tailwind('text-darkprimary-500')}
        light={tailwind('text-primary-500')}
        style={tailwind('text-sm')}
      >
        {translate('screens/OceanInterface', 'OK')}
      </ThemedText>
    </TouchableOpacity>
  )
}

enum ErrorCodes {
  UnknownError = 0,
  InsufficientUTXO = 1,
  InsufficientBalance = 2,
  PoolSwapHigher = 3,
}

interface ErrorMapping {
  code: ErrorCodes
  message: string
}

function errorMessageMapping (err: string): ErrorMapping {
  if (err === 'not enough balance after combing all prevouts') {
    return {
      code: ErrorCodes.InsufficientUTXO,
      message: 'Insufficient UTXO DFI'
    }
  } else if (err.includes('amount') && err.includes('is less than')) {
    return {
      code: ErrorCodes.InsufficientBalance,
      message: 'Not enough balance'
    }
  } else if (err.includes('Price is higher than indicated.')) {
    return {
      code: ErrorCodes.PoolSwapHigher,
      message: 'Price is higher than indicated'
    }
  }

  return {
    code: ErrorCodes.UnknownError,
    message: err
  }
}
