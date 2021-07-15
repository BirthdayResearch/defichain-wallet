import { WhaleApiClient } from '@defichain/whale-api-client'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Linking, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Text } from '..'
import { Logging } from '../../api/logging'
import { PrimaryColor, PrimaryColorStyle } from '../../constants/Theme'
import { useWhaleApiClient } from '../../contexts/WhaleContext'
import { RootState } from '../../store'
import { firstTransactionSelector, ocean, OceanTransaction } from '../../store/ocean'
import { translate } from '../../translations'

const MAX_AUTO_RETRY = 1

async function handlePress (txid: string): Promise<void> {
  // TODO(thedoublejay) explorer URL
  const url = `https://explorer.defichain.io/#/DFI/mainnet/tx/${txid}`
  const supported = await Linking.canOpenURL(url)
  if (supported) {
    await Linking.openURL(url)
  }
}

async function broadcastTransaction (tx: OceanTransaction, client: WhaleApiClient, retries: number = 0): Promise<string> {
  try {
    return await client.transactions.send({ hex: tx.signed.toHex() })
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

  // store
  const { height, err: e } = useSelector((state: RootState) => state.ocean)
  const transaction = useSelector((state: RootState) => firstTransactionSelector(state.ocean))

  // state
  const [tx, setTx] = useState<OceanTransaction|undefined>(transaction)
  const [err, setError] = useState<Error | undefined>(e)

  const slideAnim = useRef(new Animated.Value(0)).current
  Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: false }).start()

  const dismissDrawer = useCallback(() => {
    setTx(undefined)
    setError(undefined)
  }, [])

  useEffect(() => {
    // last available job will remained in this UI state until get dismissed
    if (transaction !== undefined) {
      setTx({
        ...transaction,
        broadcasted: false
      })

      broadcastTransaction(transaction, client)
        .then(() => setTx({ ...transaction, broadcasted: true, title: translate('screens/OceanInterface', 'Sent') }))
        .catch((e: Error) => setError(e))
        .finally(() => dispatch(ocean.actions.popTransaction())) // remove the job as soon as completion
    }
  }, [transaction])

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
          ? <TransactionError txid={tx.signed.txId} onClose={dismissDrawer} />
          : <TransactionDetail tx={tx} onClose={dismissDrawer} />
      }
    </Animated.View>
  )
}

function TransactionDetail ({ tx, onClose }: { tx: OceanTransaction, onClose: () => void }): JSX.Element {
  return (
    <>
      {
        !tx.broadcasted ? <ActivityIndicator color={PrimaryColor} />
          : <MaterialIcons name='check-circle' size={20} color='#02B31B' />
      }
      <View style={tailwind('flex-grow mr-1 justify-center items-center text-center')}>
        <Text
          style={tailwind('text-sm font-bold')}
        >{translate('screens/OceanInterface', tx.title ?? 'Loading...')}
        </Text>
        {
          tx.signed.txId !== undefined && <TransactionIDButton txid={tx.signed.txId} />
        }
      </View>
      {
        tx.broadcasted && <TransactionCloseButton onPress={onClose} />
      }
    </>
  )
}

function TransactionError ({ txid, onClose }: { txid: string | undefined, onClose: () => void }): JSX.Element {
  return (
    <>
      <MaterialIcons name='error' size={20} color='#ff0000' />
      <View style={tailwind('flex-grow mr-1 justify-center items-center text-center')}>
        <Text
          style={tailwind('text-sm font-bold')}
        >{`${translate('screens/OceanInterface', 'An error has occurred')}`}
        </Text>
        {
          txid !== undefined && <TransactionIDButton txid={txid} />
        }
      </View>
      <TransactionCloseButton onPress={onClose} />
    </>
  )
}

function TransactionIDButton ({ txid }: { txid: string }): JSX.Element {
  return (
    <TouchableOpacity
      testID='oceanNetwork_explorer' style={tailwind('flex-row bg-white p-1 items-center')}
      onPress={async () => await handlePress(txid)}
    >
      <Text style={[PrimaryColorStyle.text, tailwind('text-sm font-medium mr-1')]}>
        {`${txid.substring(0, 15)}...`}
      </Text>
      <MaterialIcons name='open-in-new' size={18} color={PrimaryColor} />
    </TouchableOpacity>
  )
}

function TransactionCloseButton (props: { onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      testID='oceanInterface_close' onPress={props.onPress} style={tailwind('px-2 py-1 rounded border border-gray-300 rounded flex-row justify-center items-center')}
    >
      <Text style={[PrimaryColorStyle.text, tailwind('text-sm')]}>
        {translate('screens/OceanInterface', 'OK')}
      </Text>
    </TouchableOpacity>
  )
}
