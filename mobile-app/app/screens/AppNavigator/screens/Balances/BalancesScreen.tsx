import { getNativeIcon } from '@components/icons/assets'
import { View } from '@components/index'
import {
  ThemedFlatList,
  ThemedIcon,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { useWalletContext } from '@contexts/WalletContext'
import { useWalletPersistenceContext } from '@contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import { fetchTokens, useTokensAPI } from '@hooks/wallet/TokensAPI'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackScreenProps } from '@react-navigation/stack'
import { ocean } from '@store/ocean'
import { WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { RefreshControl } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch } from 'react-redux'
import { BalanceParamList } from './BalancesNavigator'
import { BalanceText, DFIBalanceCard } from './components'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const { wallets } = useWalletPersistenceContext()
  const { isBalancesDisplayed, toggleDisplayBalances: onToggleDisplayBalances } = useDisplayBalancesContext()

  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTokens(client, address, dispatch)
    setRefreshing(false)
  }, [address, client, dispatch])

  const tokens = useTokensAPI()
  const nonDfiTokens = tokens.filter(token =>
    token.symbol !== 'DFI'
  )

  return (
    <ThemedFlatList
      ItemSeparatorComponent={() => (
        <ThemedView
          dark={tailwind('bg-gray-700')}
          light={tailwind('bg-gray-100')}
          style={tailwind('h-px')}
        />
      )}
      ListEmptyComponent={() => (
        <ThemedText
          dark={tailwind('text-gray-500')}
          light={tailwind('text-gray-500')}
          style={tailwind('text-xs font-medium ml-4 mt-2')}
          testID='empty_token_text'
        >
          {translate('screens/BalancesScreen', 'You do not have any other tokens.')}
        </ThemedText>)}
      ListHeaderComponent={(
        <>
          <DFIBalanceCard />
          <ThemedView
            style={tailwind('flex flex-row justify-between')}
          >
            <ThemedSectionTitle
              testID='balances_title'
              text={translate('screens/BalancesScreen', 'PORTFOLIO')}
            />
            <ThemedTouchableOpacity
              testID='toggle_balance'
              light={tailwind('bg-transparent')}
              dark={tailwind('bg-transparent')}
              style={tailwind('flex flex-row pt-4 pr-4 items-center')}
              onPress={onToggleDisplayBalances}
            >
              <ThemedIcon
                iconType='MaterialIcons'
                dark={tailwind('text-gray-200')}
                light={tailwind('text-black')}
                style={tailwind('self-center pr-1')}
                name={`${isBalancesDisplayed ? 'visibility' : 'visibility-off'}`}
                size={15}
                testID='toggle_balance_icon'
              />
              <ThemedText
                dark={tailwind('text-gray-500')}
                light={tailwind('text-gray-500')}
                style={tailwind('text-xs font-medium')}
                testID='toggle_balance_text'
              >
                {translate('screens/BalancesScreen', `${isBalancesDisplayed ? 'Hide' : 'Show'} balances`)}
              </ThemedText>
            </ThemedTouchableOpacity>
          </ThemedView>
        </>
      )}
      data={nonDfiTokens}
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      }
      renderItem={({ item }) => {
        return (
          <BalanceItemRow
            key={item.symbol}
            onPress={() => navigation.navigate({ name: 'TokenDetail', params: { token: item }, merge: true })}
            token={item}
          />
        )
      }}
      testID='balances_list'
    />
  )
}

function BalanceItemRow ({
  token,
  onPress
}: { token: WalletToken, onPress: () => void }): JSX.Element {
  const Icon = getNativeIcon(token.avatarSymbol)
  const testID = `balances_row_${token.id}`
  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      onPress={onPress}
      style={tailwind('py-4 pl-4 pr-2 flex-row justify-between items-center')}
      testID={testID}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <Icon testID={`${testID}_icon`} />

        <View style={tailwind('mx-3 flex-auto')}>
          <ThemedText
            dark={tailwind('text-gray-200')}
            light={tailwind('text-black')}
            style={tailwind('font-medium')}
            testID={`${testID}_symbol`}
          >
            {token.displaySymbol}
          </ThemedText>
          <ThemedText
            dark={tailwind('text-gray-400')}
            ellipsizeMode='tail'
            light={tailwind('text-gray-600')}
            numberOfLines={1}
            style={tailwind('text-sm font-medium text-gray-600')}
            testID={`${testID}_name`}
          >
            {token.name}
          </ThemedText>
        </View>
        <View style={tailwind('flex-row items-center')}>
          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value) =>
              <>
                <BalanceText
                  dark={tailwind('text-gray-200')}
                  light={tailwind('text-black')}
                  style={tailwind('mr-2 flex-wrap')}
                  testID={`${testID}_amount`}
                  value={value}
                />
                <ThemedIcon
                  dark={tailwind('text-gray-200')}
                  iconType='MaterialIcons'
                  light={tailwind('text-black')}
                  name='chevron-right'
                  size={24}
                />
              </>}
            thousandSeparator
            value={new BigNumber(token.amount).toFixed(8)}
          />
        </View>
      </View>
    </ThemedTouchableOpacity>
  )
}
