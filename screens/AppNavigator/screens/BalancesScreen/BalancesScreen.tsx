import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { PrimaryColor, PrimaryColorStyle } from '../../../../constants/Theme'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { fetchTokens, useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { translate } from '../../../../translations'
import { BalanceParamList } from './BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const address = useSelector((state: RootState) => state.wallet.address)
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useDispatch()
  const whaleAPI = useWhaleApiClient()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTokens(address, dispatch, whaleAPI)
    setRefreshing(false)
  }, [])

  const tokens = useTokensAPI()
  return (
    <FlatList
      testID='balances_list'
      style={tailwind('bg-gray-100')}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      data={tokens}
      renderItem={({ item }) => <BalanceItemRow token={item} key={item.symbol} />}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      ListHeaderComponent={
        <View style={tailwind('flex-row justify-end px-4 py-3 bg-white border-b border-gray-200')}>
          <BalanceActionButton
            icon='arrow-downward' title='RECEIVE'
            onPress={() => navigation.navigate('Receive')}
          />
        </View>
      }
    />
  )
}

function BalanceItemRow ({ token }: { token: AddressToken }): JSX.Element {
  const Icon = getTokenIcon(token.symbol)

  return (
    <View testID={`balances_row_${token.id}`} style={tailwind('bg-white p-4 flex-row justify-between items-center')}>
      <View style={tailwind('flex-row items-center')}>
        <Icon />
        <View style={tailwind('mx-3')}>
          <Text>{token.symbol}</Text>
          <Text style={tailwind('text-xs font-medium text-gray-600')}>{token.name}</Text>
        </View>
      </View>

      <NumberFormat
        value={token.amount} decimalScale={3} thousandSeparator displayType='text'
        renderText={(value) => <Text testID={`balances_row_${token.id}_amount`}>{value}</Text>}
      />
    </View>
  )
}

function BalanceActionButton (props: {
  icon: React.ComponentProps<typeof MaterialIcons>['name']
  title: string
  onPress: () => void
}): JSX.Element {
  return (
    <TouchableOpacity
      testID={`button_${props.title}`} style={[tailwind('px-2 py-1.5 ml-3 flex-row items-center border border-gray-300 rounded')]}
      onPress={props.onPress}
    >
      <MaterialIcons name={props.icon} size={20} color={PrimaryColor} />
      <Text style={[tailwind('mx-1'), PrimaryColorStyle.text]}>
        {translate('screens/BalancesScreen', props.title)}
      </Text>
    </TouchableOpacity>
  )
}
