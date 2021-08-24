import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { RefreshControl } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch } from 'react-redux'
import { View } from '../../../../components'
import { getNativeIcon } from '../../../../components/icons/assets'
import { SectionTitle } from '../../../../components/SectionTitle'
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '../../../../components/themed'
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
    <ThemedFlatList
      testID='balances_list'
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      data={tokens}
      renderItem={({ item }) =>
        <BalanceItemRow
          token={item} key={item.symbol}
          onPress={() => navigation.navigate({ name: 'TokenDetail', params: { token: item }, merge: true })}
        />}
      ItemSeparatorComponent={() => <ThemedView style={tailwind('h-px')} light='bg-gray-100' dark='bg-gray-700' />}
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
  const Icon = getNativeIcon(token.avatarSymbol)
  const testID = `balances_row_${token.id}`
  return (
    <ThemedTouchableOpacity
      onPress={onPress} testID={testID}
      style={tailwind('py-4 pl-4 pr-2 flex-row justify-between items-center')}
      light='bg-white'
      dark='bg-gray-800'
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <Icon testID={`${testID}_icon`} />
        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            testID={`${testID}_symbol`}
            style={tailwind('font-medium')}
            light='text-black'
            dark='text-white text-opacity-90'
          >{token.displaySymbol}
          </ThemedText>
          <ThemedText
            testID={`${testID}_name`}
            numberOfLines={1}
            ellipsizeMode='tail'
            style={tailwind('text-sm font-medium text-gray-600')}
            light='text-gray-600'
            dark='text-white text-opacity-70'
          >{token.name}
          </ThemedText>
        </View>
        <View style={tailwind('flex-row items-center')}>
          <NumberFormat
            value={new BigNumber(token.amount).toFixed(8)} decimalScale={8} thousandSeparator displayType='text'
            renderText={(value) =>
              <>
                <ThemedText
                  style={tailwind('mr-2 flex-wrap')} light='text-black'
                  dark='text-white text-opacity-90' testID={`${testID}_amount`}
                >
                  {value}
                </ThemedText>
                <ThemedIcon
                  iconType='MaterialIcons' name='chevron-right' size={24}
                  light='text-black' dark='text-white text-opacity-90'
                />
              </>}
          />
        </View>
      </View>
    </ThemedTouchableOpacity>
  )
}
