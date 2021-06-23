import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationProp } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import * as React from 'react'
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import tailwind from 'tailwind-rn'
import { NumberText } from '../../../../components'

import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { PrimaryColor, PrimaryColorStyle } from '../../../../constants/Theme'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { fetchTokens, useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { translate } from '../../../../translations'

interface OperationButtonProps {
  iconName: string | any
  title: string
  navigateTo: string
  navigator: NavigationProp<any>
}

export function BalancesScreen ({ navigation }: { navigation: NavigationProp<any> }): JSX.Element {
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
      data={tokens}
      testID='balances_list'
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      renderItem={({ item }) => <BalanceItemRow token={item} key={item.symbol} />}
      ListHeaderComponent={
        <>
          <View style={tailwind('flex flex-row p-3 bg-white border-b border-gray-200')}>
            <OperationButton iconName='arrow-down' title='receive' navigateTo='receive' navigator={navigation} />
            <OperationButton iconName='arrow-up' title='send' navigateTo='send' navigator={navigation} />
          </View>
          <Text testID='balances_title' style={tailwind('font-bold p-4 text-base')}>
            {translate('screens/BalancesScreen', 'Portfolio')}
          </Text>
        </>
      }
    />
  )
}

function BalanceItemRow ({ token }: { token: AddressToken }): JSX.Element {
  const Icon = getTokenIcon(token.symbol)
  const baseTestID = `balances_row_${token.id}`
  return (
    <View testID={baseTestID} style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center h-16')}>
      <View style={tailwind('w-8')}>
        <Icon testID={`${baseTestID}_icon`} />
      </View>
      <View style={tailwind('flex flex-col ml-3')}>
        <Text testID={`${baseTestID}_symbol`} style={tailwind('font-medium')}>{token.symbol}</Text>
        <Text
          testID={`${baseTestID}_name`}
          style={tailwind('text-xs text-gray-400 overflow-hidden')}
        >{token.name}
        </Text>
      </View>
      <Text testID={`${baseTestID}_amount`} style={tailwind('flex-grow text-right font-medium overflow-hidden ml-3')}>
        <NumberText value={token.amount} />
      </Text>
    </View>
  )
}

function OperationButton (props: OperationButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      testID={`button_${props.title}`} onPress={() => props.navigator.navigate(props.navigateTo)}
      style={tailwind('px-2 py-1 border-2 border-gray-200 flex flex-row rounded-md uppercase mr-2.5')}
    >
      <MaterialCommunityIcons style={tailwind('self-center')} name={props.iconName} size={16} color={PrimaryColor} />
      <Text
        style={[PrimaryColorStyle.text, tailwind('ml-1 text-sm font-medium uppercase')]}
      >{translate('screens/BalancesScreen', props.title)}
      </Text>
    </TouchableOpacity>
  )
}
