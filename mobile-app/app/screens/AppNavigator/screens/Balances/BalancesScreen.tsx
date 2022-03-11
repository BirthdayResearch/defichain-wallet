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
import { batch, useDispatch, useSelector } from 'react-redux'
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
import { fetchVaults, LoanVault, vaultsSelector } from '@store/loans'
import { LoanVaultState, LoanVaultTokenAmount } from '@defichain/whale-api-client/dist/api/loan'
import { useIsFocused } from '@react-navigation/native'
import { BalanceCards, ButtonGroupTabKey } from './components/BalanceCards'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export interface BalanceRowToken extends WalletToken {
  usdAmount: BigNumber
}

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const isFocused = useIsFocused()
  const { wallets } = useWalletPersistenceContext()
  const {
    isBalancesDisplayed,
    toggleDisplayBalances: onToggleDisplayBalances
  } = useDisplayBalancesContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const vaults = useSelector((state: RootState) => vaultsSelector(state.loans))

  const dispatch = useDispatch()
  const { getTokenPrice } = useTokenPrice()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  useEffect(() => {
    fetchPortfolioData()
  }, [address, blockCount])

  const fetchPortfolioData = (): void => {
    batch(() => {
      // do not add isFocused condition as its keeping token data updated in background
      dispatch(fetchTokens({
        client,
        address
      }))
      if (isFocused) {
        dispatch(fetchVaults({
          address,
          client
        }))
      }
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
     return vaults.reduce((totalLockedUSDValue: BigNumber, vault: LoanVault) => {
      if (vault.state === LoanVaultState.IN_LIQUIDATION) {
        return totalLockedUSDValue
      }
      const totalCollateralUSDAmount: BigNumber = vault.collateralAmounts.reduce(
        (totalCollateralUSDAmount: BigNumber, token: LoanVaultTokenAmount) => {
        const usdAmount = getTokenPrice(token.symbol, new BigNumber(token.amount))
          return totalCollateralUSDAmount.plus(usdAmount.isNaN() ? 0 : usdAmount)
      }, new BigNumber(0))

      return totalLockedUSDValue.plus(totalCollateralUSDAmount.isNaN() ? 0 : totalCollateralUSDAmount)
    }, new BigNumber(0))
  }, [getTokenPrice, vaults])

  const [filteredTokens, setFilteredTokens] = useState(dstTokens) // TODO: check the type state declaration

  // tab items
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.AllTokens)
  const handleButtonFilter = useCallback((buttonGroupTabKey: ButtonGroupTabKey) => {
    const filterTokens = dstTokens.filter((dstToken) => {
      switch (buttonGroupTabKey) {
        case ButtonGroupTabKey.LPTokens:
          return dstToken.isLPS

        case ButtonGroupTabKey.Crypto:
          return dstToken.isDAT

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
      <ThemedSectionTitle text={translate('screens/BalancesScreen', 'YOUR ASSETS')} style={tailwind('px-4 pt-2 pb-2 text-xs font-medium')} />
      <DFIBalanceCard />
      {/* filter tab  */}
      <View style={tailwind('flex')}>
        <BalanceCards
          // dstTokens={filteredTokens}
          // navigation={navigation}
          buttonGroupOptions={{
            activeButtonGroup: activeButtonGroup,
            setActiveButtonGroup: setActiveButtonGroup,
            onButtonGroupPress: handleButtonFilter
          }}
        />
        <BalanceList dstTokens={filteredTokens} navigation={navigation} />
      </View>

    </ThemedScrollView>
  )
}

// TODO: refactoring this function into BalanceCards component
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
            <>
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
            </>
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
