import * as React from 'react'
import tailwind from 'tailwind-rn'
import { translate } from '../../../../../translations'
import { View, Linking } from 'react-native'
import { Text } from '../../../../../components'
import { StackScreenProps } from '@react-navigation/stack'
import { TransactionsParamList } from '../TransactionsNavigator'
import { Ionicons } from '@expo/vector-icons'
import { activityToTxRow } from './reducer'

// FIXME(@ivan-zynesis): envvar
const EXPLORER_BASE_URL = 'https://explorer.defichain.io'

type Props = StackScreenProps<TransactionsParamList, 'TransactionDetailScreen'>

export function TransactionDetailScreen (props: Props): JSX.Element {
  const { activity } = props.route.params
  const option = activityToTxRow(activity)

  const grayDivider = <View style={tailwind('bg-gray w-full h-4')} />

  const RenderRow = (lhs: string, rhs: string): JSX.Element => {
    return (
      <View>
        {grayDivider}
        <View style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}>
          <View style={tailwind('w-1/2 flex-1')}>
            <Text style={tailwind('font-medium')}>{lhs}</Text>
          </View>
          <View style={tailwind('w-1/2 flex-1')}>
            <Text style={tailwind('font-medium text-right text-gray-600')}>{rhs}</Text>
          </View>
        </View>
      </View>
    )
  }

  const url = explorerUrl(activity.txid)
  const onTxidUrlPressed = React.useCallback(async () => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    }
  }, [url])

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
          <View style={tailwind('w-8 flex-grow-0 justify-center')}>
            <Ionicons name='open-outline' size={24} color='pink' onPress={onTxidUrlPressed} />
          </View>
        </View>
      </View>
    </View>
  )
}

function explorerUrl (txid: string): string {
  return `${EXPLORER_BASE_URL}/#/DFI/tx/${txid}`
}
