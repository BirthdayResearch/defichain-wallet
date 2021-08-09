import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { Linking, ScrollView, TouchableOpacity, View } from 'react-native'
import { Text } from '../../../../../components'
import { useDeFiScanContext } from '../../../../../contexts/DeFiScanContext'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { TransactionsParamList } from '../TransactionsNavigator'
import { formatBlockTime } from '../TransactionsScreen'

type Props = StackScreenProps<TransactionsParamList, 'TransactionDetailScreen'>

export function TransactionDetailScreen (props: Props): JSX.Element {
  const { tx } = props.route.params
  const { getTransactionUrl } = useDeFiScanContext()

  const grayDivider = <View style={tailwind('bg-gray-100 w-full h-4')} />
  const RenderRow = (lhs: string, rhs: string): JSX.Element => {
    return (
      <ScrollView testID={`transaction-detail-${lhs.toLowerCase()}`}>
        {grayDivider}
        <View style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full p-4')}>
          <View style={tailwind('w-1/2 flex-1')}>
            <Text style={tailwind('font-medium')}>{lhs}</Text>
          </View>
          <View style={tailwind('w-1/2 flex-1')}>
            <Text style={tailwind('font-medium text-right text-gray-600')}>{rhs}</Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  const onTxidUrlPressed = React.useCallback(async () => {
    // TODO(ivan-zynesis): new explorer URL linking
    const url = getTransactionUrl(tx.txid)
    await Linking.openURL(url)
  }, [])

  return (
    <View>
      {RenderRow('Type', translate('screens/TransactionDetailScreen', tx.desc))}
      {/* TODO(@ivan-zynesis): handle different transaction type other than sent/receive */}
      {RenderRow('Amount', translate('screens/TransactionDetailScreen', tx.amount))}
      {RenderRow('Block', translate('screens/TransactionDetailScreen', `${tx.block}`))}
      {RenderRow('Date', translate('screens/TransactionDetailScreen', `${formatBlockTime(tx.medianTime)}`))}
      {grayDivider}
      <TouchableOpacity
        testID='transaction-detail-explorer-url'
        style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full p-4')}
        onPress={onTxidUrlPressed}
      >
        <View style={tailwind('flex-1 flex-row flex-initial')}>
          <View style={tailwind('flex-1')}>
            <Text style={tailwind('text-primary font-medium text-sm')}>
              {tx.txid}
            </Text>
          </View>
          <View style={tailwind('ml-2 flex-grow-0 justify-center')}>
            <MaterialIcons name='open-in-new' size={24} style={tailwind('text-primary')} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}
