import { MaterialIcons } from '@expo/vector-icons'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackScreenProps } from '@react-navigation/stack'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch } from 'react-redux'
import { Text, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useWalletContext } from '../../../../contexts/WalletContext'
import { useWalletPersistenceContext } from '../../../../contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { fetchTokens, useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { ocean } from '../../../../store/ocean'
import { WalletToken } from '../../../../store/wallet'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { BalanceParamList } from './BalancesNavigator'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const [refreshing, setRefreshing] = useState(false)
  const dispatch = useDispatch()
  const { wallets } = useWalletPersistenceContext()

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTokens(client, address, dispatch)
    setRefreshing(false)
  }, [address])

  const tokens = useTokensAPI()
  return (
    <FlatList
      testID='balances_list'
      style={tailwind('bg-gray-100')}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      data={tokens}
      renderItem={({ item }) =>
        <BalanceItemRow
          token={item} key={item.symbol}
          onPress={() => navigation.navigate({ name: 'TokenDetail', params: { token: item }, merge: true })}
        />}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      ListHeaderComponent={(
        <SectionTitle
          testID='balances_title'
          text={translate('screens/BalancesScreen', 'BALANCE DETAILS')}
        />
      )}
    />
  )
}

function BalanceItemRow ({ token, onPress }: { token: WalletToken, onPress: () => void }): JSX.Element {
  const Icon = getTokenIcon(token.avatarSymbol)
  const testID = `balances_row_${token.id}`
  return (
    <TouchableOpacity
      onPress={onPress} testID={testID}
      style={tailwind('bg-white py-4 pl-4 pr-2 flex-row justify-between items-center')}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <Icon testID={`${testID}_icon`} />
        <View style={tailwind('mx-3 flex-auto')}>
          <Text testID={`${testID}_symbol`} style={tailwind('font-medium')}>{token.displaySymbol}</Text>
          <Text
            testID={`${testID}_name`}
            numberOfLines={1}
            ellipsizeMode='tail'
            style={tailwind('text-sm font-medium text-gray-600')}
          >{token.name}
          </Text>
        </View>
        <View style={tailwind('flex-row items-center')}>
          <NumberFormat
            value={token.amount} decimalScale={8} thousandSeparator displayType='text'
            renderText={(value) =>
              <>
                <Text style={tailwind('mr-2 flex-wrap')} testID={`${testID}_amount`}>
                  {value}
                </Text>
                <MaterialIcons name='chevron-right' size={24} />
              </>}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}
