import { getNativeIcon } from '@components/icons/assets'
import { View } from '@components'
import {
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedTouchableOpacity
} from '@components/themed'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { ocean } from '@store/ocean'
import { fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BalanceParamList } from './BalancesNavigator'
import { Announcements } from '@screens/AppNavigator/screens/Balances/components/Announcements'
import { DFIBalanceCard } from '@screens/AppNavigator/screens/Balances/components/DFIBalanceCard'
import { translate } from '@translations'
import { RefreshControl } from 'react-native'
import { BalanceControlCard } from '@screens/AppNavigator/screens/Balances/components/BalanceControlCard'
import { EmptyBalances } from '@screens/AppNavigator/screens/Balances/components/EmptyBalances'
import { RootState } from '@store'
import { useTokenPrice } from './hooks/TokenPrice'
import { TokenNameText } from '@screens/AppNavigator/screens/Balances/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Balances/components/TokenAmountText'
import { TotalPortfolio } from './components/TotalPortfolio'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export interface BalanceRowToken extends WalletToken {
  usdAmount: BigNumber
}

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
  const { getTokenPrice } = useTokenPrice()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  useEffect(() => {
    dispatch(fetchTokens({
      client,
      address
    }))
  }, [address, blockCount])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    dispatch(fetchTokens({
      client,
      address
    }))
    setRefreshing(false)
  }, [address, client, dispatch])

  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const {
    totalUSDValue,
    dstTokens
  } = useMemo(() => {
     return tokens.reduce(
    ({
      totalUSDValue,
      dstTokens
    }: { totalUSDValue: BigNumber, dstTokens: BalanceRowToken[] },
      token
    ) => {
      const usdAmount = getTokenPrice(token.symbol, new BigNumber(token.amount), token.isLPS)

      if (token.symbol === 'DFI') {
        return {
          // `token.id === '0_unified'` to avoid repeated DFI price to get added in totalUSDValue
          totalUSDValue: token.id === '0_unified'
            ? totalUSDValue
            : totalUSDValue.plus(usdAmount.isNaN() ? 0 : usdAmount),
          dstTokens
        }
      }
      return {
        totalUSDValue: totalUSDValue.plus(usdAmount.isNaN() ? 0 : usdAmount),
        dstTokens: [...dstTokens, {
          ...token,
          usdAmount
        }]
      }
    }, {
      totalUSDValue: new BigNumber(0),
      dstTokens: []
    })
  }, [getTokenPrice, tokens])

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
      <TotalPortfolio
        totalUSDValue={totalUSDValue}
        onToggleDisplayBalances={onToggleDisplayBalances}
        isBalancesDisplayed={isBalancesDisplayed}
      />
      <ThemedSectionTitle text={translate('screens/BalancesScreen', 'YOUR ASSETS')} style={tailwind('px-4 pt-2 pb-2 text-xs font-medium')} />
      <DFIBalanceCard />
      <BalanceList dstTokens={dstTokens} navigation={navigation} />
    </ThemedScrollView>
  )
}

function BalanceList ({
  dstTokens,
  navigation
}: { dstTokens: BalanceRowToken[], navigation: StackNavigationProp<BalanceParamList> }): JSX.Element {
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))

  if (!hasFetchedToken) {
    return (
      <View style={tailwind('px-4 py-1.5 -mb-3')}>
        <SkeletonLoader row={4} screen={SkeletonLoaderScreen.Balance} />
      </View>
    )
  }

  return (
    <>
      {
        dstTokens.length === 0
          ? (
            <EmptyBalances />
          )
          : (
            <View testID='card_balance_row_container'>
              {dstTokens.sort((a, b) => new BigNumber(b.usdAmount).minus(new BigNumber(a.usdAmount)).toNumber()).map((item) => (
                <View key={item.symbol} style={tailwind('p-4 pt-1.5 pb-1.5')}>
                  <BalanceItemRow
                    onPress={() => navigation.navigate({
                      name: 'TokenDetail',
                      params: { token: item },
                      merge: true
                    })}
                    token={item}
                  />
                </View>
              ))}
            </View>
            )
      }
    </>
  )
}

function BalanceItemRow ({
  token,
  onPress
}: { token: BalanceRowToken, onPress: () => void }): JSX.Element {
  const Icon = getNativeIcon(token.displaySymbol)
  const testID = `balances_row_${token.id}`
  const { isBalancesDisplayed } = useDisplayBalancesContext()
  return (
    <ThemedTouchableOpacity
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      onPress={onPress}
      style={tailwind('p-4 rounded-lg flex-row justify-between items-center')}
      testID={testID}
    >
      <View style={tailwind('flex-row items-center flex-grow')}>
        <Icon testID={`${testID}_icon`} />
        <TokenNameText displaySymbol={token.displaySymbol} name={token.name} testID={testID} />
        <TokenAmountText
          tokenAmount={token.amount} usdAmount={token.usdAmount} testID={testID}
          isBalancesDisplayed={isBalancesDisplayed}
        />
      </View>
    </ThemedTouchableOpacity>
  )
}
