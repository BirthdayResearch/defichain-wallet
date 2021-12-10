import { getNativeIcon } from '@components/icons/assets'
import { View } from '@components'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView
} from '@components/themed'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackScreenProps } from '@react-navigation/stack'
import { ocean } from '@store/ocean'
import { fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { BalanceParamList } from './BalancesNavigator'
import { BalanceText } from './components/BalanceText'
import { Announcements } from '@screens/AppNavigator/screens/Balances/components/Announcements'
import { DFIBalanceCard } from '@screens/AppNavigator/screens/Balances/components/DFIBalanceCard'
import { translate } from '@translations'
import { RefreshControl } from 'react-native'
import { BalanceControlCard } from '@screens/AppNavigator/screens/Balances/components/BalanceControlCard'
import { EmptyBalances } from '@screens/AppNavigator/screens/Balances/components/EmptyBalances'
import { RootState } from '@store'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const { wallets } = useWalletPersistenceContext()
  const {
    isBalancesDisplayed,
    toggleDisplayBalances: onToggleDisplayBalances
  } = useDisplayBalancesContext()
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0

  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  useEffect(() => {
    dispatch(fetchTokens({ client, address }))
  }, [address, blockCount])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    dispatch(fetchTokens({ client, address }))
    setRefreshing(false)
  }, [address, client, dispatch])

  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const dstTokens = tokens.filter(token =>
    token.symbol !== 'DFI'
  )

  return (
    <ThemedScrollView
      contentContainerStyle={tailwind('pb-8')} testID='balances_list'
      refreshControl={
        <RefreshControl
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      }
    >
      <Announcements />
      <BalanceControlCard />
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
            dark={tailwind('text-darkprimary-500')}
            light={tailwind('text-primary-500')}
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
      <DFIBalanceCard />
      {
        dstTokens.length === 0
          ? (
            <EmptyBalances />
          )
          : (
            dstTokens.map((item) => (
              <BalanceItemRow
                key={item.symbol}
                onPress={() => navigation.navigate({
                  name: 'TokenDetail',
                  params: { token: item },
                  merge: true
                })}
                token={item}
              />
            ))
          )
      }
    </ThemedScrollView>
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
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-100')}
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
