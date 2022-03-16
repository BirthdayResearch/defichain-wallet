import { ThemedScrollView } from '@components/themed'
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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { BalanceParamList } from './BalancesNavigator'
import { Announcements } from '@screens/AppNavigator/screens/Balances/components/Announcements'
import { DFIBalanceCard } from '@screens/AppNavigator/screens/Balances/components/DFIBalanceCard'
import { RefreshControl } from 'react-native'
import { BalanceControlCard } from '@screens/AppNavigator/screens/Balances/components/BalanceControlCard'
import { RootState } from '@store'
import { useTokenPrice } from './hooks/TokenPrice'
import { TotalPortfolio } from './components/TotalPortfolio'
import { LockedBalance, useTokenLockedBalance } from './hooks/TokenLockedBalance'
import { fetchCollateralTokens, fetchVaults } from '@store/loans'
import { BalanceCard, ButtonGroupTabKey } from './components/BalanceCard'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export interface BalanceRowToken extends WalletToken {
  usdAmount: BigNumber
}

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const { wallets } = useWalletPersistenceContext()
  const lockedTokens = useTokenLockedBalance({}) as Map<string, LockedBalance>
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
    fetchPortfolioData()
  }, [address, blockCount])

  useEffect(() => {
    // fetch only once to decide flag to display locked balance breakdown
    dispatch(fetchCollateralTokens({ client }))
  }, [])

  const fetchPortfolioData = (): void => {
    batch(() => {
      // do not add isFocused condition as its keeping token data updated in background
      dispatch(fetchTokens({
        client,
        address
      }))
      dispatch(fetchVaults({ client, address }))
    })
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    fetchPortfolioData()
    setRefreshing(false)
  }, [address, client, dispatch])

  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const {
    totalAvailableUSDValue,
    dstTokens
  } = useMemo(() => {
    return tokens.reduce(
      ({
        totalAvailableUSDValue,
        dstTokens
      }: { totalAvailableUSDValue: BigNumber, dstTokens: BalanceRowToken[] },
        token
      ) => {
        const usdAmount = getTokenPrice(token.symbol, new BigNumber(token.amount), token.isLPS)

        if (token.symbol === 'DFI') {
          return {
            // `token.id === '0_unified'` to avoid repeated DFI price to get added in totalAvailableUSDValue
            totalAvailableUSDValue: token.id === '0_unified'
              ? totalAvailableUSDValue
              : totalAvailableUSDValue.plus(usdAmount.isNaN() ? 0 : usdAmount),
            dstTokens
          }
        }
        return {
          totalAvailableUSDValue: totalAvailableUSDValue.plus(usdAmount.isNaN() ? 0 : usdAmount),
          dstTokens: [...dstTokens, {
            ...token,
            usdAmount
          }]
        }
      }, {
      totalAvailableUSDValue: new BigNumber(0),
      dstTokens: []
    })
  }, [getTokenPrice, tokens])

  const totalLockedUSDValue = useMemo(() => {
    if (lockedTokens === undefined) {
      return new BigNumber(0)
    }
    return [...lockedTokens.values()]
      .reduce((totalLockedUSDValue: BigNumber, value: LockedBalance) =>
        totalLockedUSDValue.plus(value.tokenValue.isNaN() ? 0 : value.tokenValue),
      new BigNumber(0))
  }, [lockedTokens])

  const [filteredTokens, setFilteredTokens] = useState(dstTokens)

  // tab items
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.AllTokens)
  const handleButtonFilter = useCallback((buttonGroupTabKey: ButtonGroupTabKey) => {
    const filterTokens = dstTokens.filter((dstToken) => {
      switch (buttonGroupTabKey) {
        case ButtonGroupTabKey.LPTokens:
          return dstToken.isLPS

        case ButtonGroupTabKey.Crypto:
          return dstToken.isDAT && !dstToken.isLoanToken

        case ButtonGroupTabKey.dTokens:
          return dstToken.isLoanToken

        // for All token tab will return true for list of dstToken
        default:
          return true
      }
    })
    setFilteredTokens(filterTokens)
  }, [dstTokens])

  // to update filter list from selected tab
  useEffect(() => {
    handleButtonFilter(activeButtonGroup)
  }, [dstTokens])

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
        totalAvailableUSDValue={totalAvailableUSDValue}
        totalLockedUSDValue={totalLockedUSDValue}
        onToggleDisplayBalances={onToggleDisplayBalances}
        isBalancesDisplayed={isBalancesDisplayed}
      />
      <DFIBalanceCard />
      <BalanceCard
        filteredTokens={filteredTokens}
        navigation={navigation}
        buttonGroupOptions={{
          activeButtonGroup: activeButtonGroup,
          setActiveButtonGroup: setActiveButtonGroup,
          onButtonGroupPress: handleButtonFilter
        }}
      />
    </ThemedScrollView>
  )
}
