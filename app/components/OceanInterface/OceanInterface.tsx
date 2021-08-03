import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { Transaction } from '@defichain/whale-api-client/dist/api/transactions'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Linking, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Text } from '..'
import { Logging } from '../../api'
import { useWallet } from '../../contexts/WalletContext'
import { useWhaleApiClient } from '../../contexts/WhaleContext'
import { getEnvironment } from '../../environment'
import { fetchTokens } from '../../hooks/wallet/TokensAPI'
import { RootState } from '../../store'
import { firstTransactionSelector, ocean, OceanTransaction } from '../../store/ocean'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

const MAX_AUTO_RETRY = 1
const MAX_TIMEOUT = 300000
const INTERVAL_TIME = 5000

async function gotoExplorer (txid: string): Promise<void> {
  // TODO(thedoublejay) explorer URL
  const url = `https://explorer.defichain.io/#/DFI/mainnet/tx/${txid}`
  // TODO (future improvement): this page should support in mempool, to be confirm
  const supported = await Linking.canOpenURL(url)
  if (supported) {
    await Linking.openURL(url)
  }
}

async function broadcastTransaction (tx: CTransactionSegWit, client: WhaleApiClient, retries: number = 0): Promise<string> {
  try {
    return await client.transactions.send({ hex: tx.toHex() })
  } catch (e) {
    Logging.error(e)
    if (retries < MAX_AUTO_RETRY) {
      return await broadcastTransaction(tx, client, retries + 1)
    }
    throw e
  }
}

async function waitForTxConfirmation (id: string, client: WhaleApiClient): Promise<Transaction> {
  const initialTime = getEnvironment().debug ? 5000 : 30000
  let start = initialTime

  return await new Promise((resolve, reject) => {
    let intervalID: number
    const callTransaction = (): void => {
      client.transactions.get(id).then((tx) => {
        if (intervalID !== undefined) {
          clearInterval(intervalID)
        }
        resolve(tx)
      }).catch((e) => {
        if (start >= MAX_TIMEOUT) {
          Logging.error(e)
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
 * Need to get the height of bottom tab via `useBottomTabBarHeight()` hook to be called on screen.
 * */
export function OceanInterface (): JSX.Element | null {
  const dispatch = useDispatch()
  const client = useWhaleApiClient()
  const walletContext = useWallet()

  // store
  const { height, err: e } = useSelector((state: RootState) => state.ocean)
  const transaction = useSelector((state: RootState) => firstTransactionSelector(state.ocean))
  const slideAnim = useRef(new Animated.Value(0)).current
  const address = useSelector((state: RootState) => state.wallet.address)
  // state
  const [tx, setTx] = useState<OceanTransaction | undefined>(transaction)
  const [err, setError] = useState<Error | undefined>(e)

  const dismissDrawer = useCallback(() => {
    setTx(undefined)
    setError(undefined)
    slideAnim.setValue(0)
  }, [])

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
          setTx({
            ...transaction,
            title: translate('screens/OceanInterface', 'Waiting for confirmation')
          })
          let title
          try {
            await waitForTxConfirmation(transaction.tx.txId, client)
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
          setError(new Error(errMsg))
        })
        .finally(() => {
          dispatch(ocean.actions.popTransaction())
          fetchTokens(client, address, dispatch)
        }) // remove the job as soon as completion
    }
  }, [transaction, walletContext])

  if (tx === undefined) {
    return null
  }

  return (
    <Animated.View
      style={[tailwind('bg-white px-5 py-3 flex-row absolute w-full items-center border-t border-gray-200 z-10'), {
        bottom: slideAnim,
        height: 75
      }]}
    >
      {
        err !== undefined
          ? <TransactionError errMsg={err.message} onClose={dismissDrawer} />
          : <TransactionDetail broadcasted={tx.broadcasted} title={tx.title} txid={tx.tx.txId} onClose={dismissDrawer} />
      }
    </Animated.View>
  )
}

function TransactionDetail ({
  broadcasted,
  txid,
  onClose,
  title
}: { broadcasted: boolean, txid?: string, onClose: () => void, title?: string }): JSX.Element {
  title = title ?? translate('screens/OceanInterface', 'Signing...')
  return (
    <>
      {
        !broadcasted ? <ActivityIndicator style={tailwind('text-primary')} />
          : <MaterialIcons name='check-circle' size={20} style={tailwind('text-success')} />
      }
      <View style={tailwind('flex-auto mx-6 justify-center items-center text-center')}>
        <Text
          style={tailwind('text-sm font-bold')}
        >{title}
        </Text>
        {
          txid !== undefined && <TransactionIDButton txid={txid} onPress={async () => await gotoExplorer(txid)} />
        }
      </View>
      {
        broadcasted && <TransactionCloseButton onPress={onClose} />
      }
    </>
  )
}

function TransactionError ({ errMsg, onClose }: { errMsg: string | undefined, onClose: () => void }): JSX.Element {
  return (
    <>
      <MaterialIcons name='error' size={20} color='#ff0000' />
      <View style={tailwind('flex-auto mx-2 justify-center items-center text-center')}>
        <Text
          style={tailwind('text-sm font-bold')}
        >{`${translate('screens/OceanInterface', 'An error has occurred')}`}
        </Text>
        <Text
          style={tailwind('text-sm font-bold')}
          numberOfLines={1}
          ellipsizeMode='tail'
        >{errMsg}
        </Text>
      </View>
      <TransactionCloseButton onPress={onClose} />
    </>
  )
}

function TransactionIDButton ({ txid, onPress }: { txid: string, onPress?: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID='oceanNetwork_explorer' style={tailwind('flex-row p-1 items-center')}
      onPress={onPress}
    >
      <Text
        style={tailwind('text-sm font-medium mr-1 text-primary')} numberOfLines={1}
        ellipsizeMode='tail'
      >
        {txid}
      </Text>
      <MaterialIcons name='open-in-new' size={18} style={tailwind('text-primary')} />
    </TouchableOpacity>
  )
}

function TransactionCloseButton (props: { onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID='oceanInterface_close' onPress={props.onPress}
      style={tailwind('px-2 py-1 rounded border border-gray-300 rounded flex-row justify-center items-center')}
    >
      <Text style={tailwind('text-sm text-primary')}>
        {translate('screens/OceanInterface', 'OK')}
      </Text>
    </TouchableOpacity>
  )
}
