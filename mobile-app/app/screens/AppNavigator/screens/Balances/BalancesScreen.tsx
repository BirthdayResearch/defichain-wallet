import { getNativeIcon } from '@components/icons/assets'
import { View } from '@components'
import {
  ThemedIcon,
  ThemedScrollView,
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
import { getActivePrice } from '../Auctions/helpers/ActivePrice'
import { ActiveUsdValue } from '../Loans/VaultDetail/components/ActiveUsdValue'

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
  const blockCount = useSelector((state: RootState) => state.block.count)

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
  const totalUsdValue = tokens.reduce((total, item) => {
    if (item.id === '0_unified') {
      return total
    }
    const value = new BigNumber(getActivePrice(item.symbol, item?.activePrice)).multipliedBy(item.amount)
    return total.plus(value)
  }, new BigNumber(0))

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
        light={tailwind('bg-white')}
        dark={tailwind('bg-gray-800')}
        style={tailwind('mx-2 my-4 p-4 rounded-lg flex flex-row justify-between items-center')}
        testID='total_portfolio_card'
      >
        <View>
          <ThemedText
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            style={tailwind('text-base text-gray-500')}
          >
            {translate('screens/BalancesScreen', 'Total Portfolio Value')}
          </ThemedText>
          <NumberFormat
            decimalScale={8}
            displayType='text'
            prefix='$'
            renderText={(value) =>
              <BalanceText
                dark={tailwind('text-gray-200')}
                light={tailwind('text-black')}
                style={tailwind('mr-2 flex-wrap text-2xl font-bold')}
                testID='total_usd_amount'
                value={value}
              />}
            thousandSeparator
            value={totalUsdValue.toFixed(2)}
          />
        </View>
        <ThemedTouchableOpacity
          testID='toggle_balance'
          light={tailwind('bg-transparent')}
          dark={tailwind('bg-transparent')}
          onPress={onToggleDisplayBalances}
        >
          <ThemedIcon
            iconType='MaterialIcons'
            dark={tailwind('text-darkprimary-500 border-gray-700')}
            light={tailwind('text-primary-500 border-gray-200')}
            style={tailwind('border rounded p-1.5')}
            name={`${isBalancesDisplayed ? 'visibility' : 'visibility-off'}`}
            size={20}
            testID='toggle_balance_icon'
          />
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
  const activePrice = new BigNumber(getActivePrice(token.symbol, token?.activePrice))
  const testID = `balances_row_${token.id}`
  const { isBalancesDisplayed } = useDisplayBalancesContext()
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
                <View style={tailwind('flex mr-2 leading-6')}>
                  <BalanceText
                    dark={tailwind('text-gray-200')}
                    light={tailwind('text-black')}
                    style={tailwind('flex-wrap')}
                    testID={`${testID}_amount`}
                    value={value}
                  />
                  {isBalancesDisplayed && (
                    <ActiveUsdValue
                      testId={`${testID}_usd_amount`}
                      price={new BigNumber(token.amount).multipliedBy(activePrice)}
                      containerStyle={tailwind('justify-end')}
                    />
                  )}
                </View>
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
