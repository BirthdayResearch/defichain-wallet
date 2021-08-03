import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { getTxURLByNetwork } from '../../../../../api/wallet'
import { Text } from '../../../../../components'
import { useNetworkContext } from '../../../../../contexts/NetworkContext'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { TransactionsParamList } from '../TransactionsNavigator'

type Props = StackScreenProps<TransactionsParamList, 'TransactionDetailScreen'>

export function TransactionDetailScreen (props: Props): JSX.Element {
  const { tx } = props.route.params
  const { network } = useNetworkContext()

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
    const url = getTxURLByNetwork(network, tx.txid)
    await Linking.openURL(url)
  }, [])

  return (
    <View>
      {RenderRow('Type', translate('screens/TransactionDetailScreen', tx.desc))}
      {/* TODO(@ivan-zynesis): handle different transaction type other than sent/receive */}
      {RenderRow('Amount', translate('screens/TransactionDetailScreen', tx.amount))}
      {RenderRow('Block', translate('screens/TransactionDetailScreen', `${tx.block}`))}
      {grayDivider}
      <View
        testID='transaction-detail-explorer-url'
        style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full p-4')}
      >
        <View style={tailwind('flex-1 flex-row flex-initial')}>
          <View style={tailwind('flex-1')}>
            <Text style={tailwind('flex-1 font-medium text-sm text-gray-500')}>
              {translate('screens/TransactionDetailScreen', tx.txid)}
            </Text>
          </View>
          <View style={tailwind('ml-2 flex-grow-0 justify-center')}>
            <MaterialIcons name='open-in-new' size={24} style={tailwind('text-primary')} onPress={onTxidUrlPressed} />
          </View>
        </View>
      </View>
    </View>
  )
}
