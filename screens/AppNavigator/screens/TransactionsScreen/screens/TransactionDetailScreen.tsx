import * as React from 'react'
import tailwind from 'tailwind-rn'
import { translate } from '../../../../../translations'
import { View, Linking } from 'react-native'
import BigNumber from 'bignumber.js'
import { Text } from '../../../../../components'
import { StackScreenProps } from '@react-navigation/stack'
import { TransactionsParamList } from '../TransactionsNavigator'
import { Ionicons } from '@expo/vector-icons'

type Props = StackScreenProps<TransactionsParamList, 'TransactionDetailScreen'>

export function TransactionDetailScreen (props: Props): JSX.Element {
  const { params } = props.route

  let color: 'green'|'gray'
  let desc = ''
  const isPositive = params.activity.vin === undefined

  // TODO(@ivan-zynesis): fix when other token transaction can be included
  const TOKEN_NAME: { [key in number]: string } = {
    0: 'DFI',
    1: 'tBTC'
  }

  const tokenId = TOKEN_NAME[params.activity.tokenId as number]
  let amount = new BigNumber(params.activity.value)

  if (isPositive) {
    color = 'green'
    // TODO(@ivan-zynesis): Simplified, more complicated token transaction should have different desc
    desc = 'Received'
  } else {
    color = 'gray'
    desc = 'Sent'
    amount = amount.negated()
  }

  // reduced result
  const option = {
    id: params.activity.id,
    desc,
    color,
    amount: amount.toFixed(),
    block: params.activity.block.height,
    token: tokenId,
    txid: params.activity.txid,
    url: ''
  }

  const grayDivider = <View style={tailwind('bg-gray w-full h-4')} />
  const RenderRow = (lhs: string, rhs: string): JSX.Element => {
    return (
      <View>
        {grayDivider}
        <View style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}>
          <View style={tailwind('w-1/2 flex-initial')}>
            <Text style={tailwind('font-medium flex-initial')}>
              {lhs}
            </Text>
          </View>
          <View style={tailwind('w-1/2 flex-end')}>
            <Text style={tailwind('font-medium flex-end text-right text-gray-500')}>
              {rhs}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  const onTxidUrlPressed = React.useCallback(async () => {
    const supported = await Linking.canOpenURL(option.url)
    if (supported) {
      await Linking.openURL(option.url)
    }
  }, [option.url])

  return (
    <View>
      {RenderRow('Type', translate('screens/TransactionDetailScreen', option.desc))}
      {/* TODO(@ivan-zynesis): handle different transaction type other than sent/receive */}
      {RenderRow('Amount', translate('screens/TransactionDetailScreen', option.amount))}
      {RenderRow('Block', translate('screens/TransactionDetailScreen', `${option.block}`))}
      {grayDivider}
      <View style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}>
        <View style={tailwind('flex-1 flex-row flex-initial')}>
          <View style={tailwind('flex-1')}>
            <Text style={tailwind('flex-1 font-medium text-gray-500')}>
              {translate('screens/TransactionDetailScreen', option.txid)}
            </Text>
          </View>
          <View style={tailwind('w-8 flex-grow-0 justify-center flex-end')}>
            <Ionicons name='open-outline' size={24} color='pink' onPress={onTxidUrlPressed} />
          </View>
        </View>
      </View>
    </View>
  )
}
