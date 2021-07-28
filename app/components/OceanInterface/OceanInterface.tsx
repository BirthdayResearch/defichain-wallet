import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Linking, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Text } from '..'
import { Logging } from '../../api/logging'
import { useWallet } from '../../contexts/WalletContext'
import { useWhaleApiClient } from '../../contexts/WhaleContext'
import { RootState } from '../../store'
import { firstTransactionSelector, ocean, OceanTransaction } from '../../store/ocean'
import { tailwind } from '../../tailwind'
import { translate } from '../../translations'

const MAX_AUTO_RETRY = 1

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
  // state
  const [tx, setTx] = useState<OceanTransaction | undefined>()
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
      setTx(transaction)

      broadcastTransaction(transaction.tx, client)
        .then(() => {
          setTx({
            ...transaction,
            broadcasted: true,
            title: translate('screens/OceanInterface', 'Transaction Sent')
          })
        })
        .catch((e: Error) => {
          const errMsg = `${e.message}. Txid: ${transaction.tx.txId}`
          setError(new Error(errMsg))
        })
        .finally(() => dispatch(ocean.actions.popTransaction())) // remove the job as soon as completion
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
          : (
            <TransactionDetail
              broadcasted={tx.broadcasted}
              txid={transaction.tx.txId}
              onClose={dismissDrawer}
            />
          )
      }
    </Animated.View>
  )
}

function TransactionDetail ({ broadcasted, txid, onClose }: { broadcasted: boolean, txid: string, onClose: () => void }): JSX.Element | null {
  const title = broadcasted ? 'Transaction Sent' : 'Broadcasting...'
  return (
    <>
      {
        !broadcasted ? <ActivityIndicator style={tailwind('text-primary')} />
          : <MaterialIcons name='check-circle' size={20} style={tailwind('text-success')} />
      }
      <View style={tailwind('flex-auto mx-6 justify-center items-center text-center')}>
        <Text
          style={tailwind('text-sm font-bold')}
        >{translate('screens/OceanInterface', title)}
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
      testID='oceanNetwork_explorer' style={tailwind('flex-row p-1 items-center  max-w')}
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
      testID='oceanInterface_close' onPress={props.onPress} style={tailwind('px-2 py-1 rounded border border-gray-300 rounded flex-row justify-center items-center')}
    >
      <Text style={tailwind('text-sm text-primary')}>
        {translate('screens/OceanInterface', 'OK')}
      </Text>
    </TouchableOpacity>
  )
}
