import { getNativeIcon } from '@components/icons/assets'
import {
  ThemedScrollView,
  ThemedTouchableOpacity,
  ThemedView
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
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { BalanceParamList } from './BalancesNavigator'
import { Announcements } from '@screens/AppNavigator/screens/Balances/components/Announcements'
import { DFIBalanceCard } from '@screens/AppNavigator/screens/Balances/components/DFIBalanceCard'
import { translate } from '@translations'
import { Platform, RefreshControl, View } from 'react-native'
import { EmptyBalances } from '@screens/AppNavigator/screens/Balances/components/EmptyBalances'
import { RootState } from '@store'
import { useTokenPrice } from './hooks/TokenPrice'
import { TokenNameText } from '@screens/AppNavigator/screens/Balances/components/TokenNameText'
import { TokenAmountText } from '@screens/AppNavigator/screens/Balances/components/TokenAmountText'
import { TotalPortfolio } from './components/TotalPortfolio'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LockedBalance, useTokenLockedBalance } from './hooks/TokenLockedBalance'
import { AddressSelectionButton } from './components/AddressSelectionButton'
import { HeaderSettingButton } from './components/HeaderSettingButton'
import { IconButton } from '@components/IconButton'
import { TokenBreakdownPercentage } from './components/TokenBreakdownPercentage'
import { TokenBreakdownDetails } from './components/TokenBreakdownDetails'
import { fetchCollateralTokens, fetchVaults } from '@store/loans'
import { BottomSheetAddressDetail } from './components/BottomSheetAddressDetail'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { CreateOrEditAddressLabelForm } from './components/CreateOrEditAddressLabelForm'
import { useThemeContext } from '@shared-contexts/ThemeProvider'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export interface BalanceRowToken extends WalletToken {
  usdAmount: BigNumber
}

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const { address, addressLength } = useWalletContext()
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
  const [isZeroBalance, setIsZeroBalance] = useState(true)

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  useEffect(() => {
    fetchPortfolioData()
  }, [address, blockCount])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (): JSX.Element => (
        <HeaderSettingButton />
      ),
      headerRight: (): JSX.Element => (
        <AddressSelectionButton address={address} addressLength={addressLength} onPress={expandModal} />
      )
    })
  }, [navigation, address, addressLength])
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

  useEffect(() => {
    setIsZeroBalance(
      !tokens.some(token => new BigNumber(token.amount).isGreaterThan(0))
    )
  }, [tokens])

  // Address selection bottom sheet
  const { isLight } = useThemeContext()
  const bottomSheetRef = useRef<BottomSheetModalMethods>(null)
  const containerRef = useRef(null)
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const expandModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(true)
    } else {
      bottomSheetRef.current?.present()
    }
  }, [])
  const dismissModal = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(false)
    } else {
      bottomSheetRef.current?.close()
    }
  }, [])
  const bottomSheetScreen = useMemo(() => {
    return [
      {
        stackScreenName: 'AddressDetail',
        component: BottomSheetAddressDetail({
          address: address,
          addressLabel: 'TODO: get label from storage api',
          onReceiveButtonPress: () => {
            dismissModal()
            navigation.navigate('Receive')
          },
          onCloseButtonPress: () => dismissModal(),
          navigateToScreen: {
            screenName: 'CreateOrEditAddressLabelForm',
            onButtonPress: () => console.log('click')
          }
        }),
        option: {
          header: () => null
        }
      },
      {
        stackScreenName: 'CreateOrEditAddressLabelForm',
        component: CreateOrEditAddressLabelForm,
        option: {
          headerStatusBarHeight: 1,
          headerBackgroundContainerStyle: tailwind('border-b', {
            'border-gray-200': isLight,
            'border-gray-700': !isLight,
            '-top-5': Platform.OS !== 'web'
          }),
          headerTitle: '',
          headerBackTitleVisible: false
        }
      }
    ]
  }, [address])

  return (
    <View ref={containerRef} style={tailwind('flex-1')}>
      <ThemedScrollView
        light={tailwind('bg-gray-50')}
        contentContainerStyle={tailwind('pb-8')} testID='balances_list'
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        }
      >
        <Announcements />
        <TotalPortfolio
          totalAvailableUSDValue={totalAvailableUSDValue}
          totalLockedUSDValue={totalLockedUSDValue}
          onToggleDisplayBalances={onToggleDisplayBalances}
          isBalancesDisplayed={isBalancesDisplayed}
        />
        <BalanceActionSection navigation={navigation} isZeroBalance={isZeroBalance} />
        <DFIBalanceCard />
        <BalanceList dstTokens={dstTokens} navigation={navigation} />
        {Platform.OS === 'web'
          ? (
            <BottomSheetWebWithNav
              modalRef={containerRef}
              screenList={bottomSheetScreen}
              isModalDisplayed={isModalDisplayed}
              modalStyle={{
                position: 'fixed',
                height: '387px',
                width: '375px',
                zIndex: 50,
                top: '42%'
              }}
            />
          )
          : (
            <BottomSheetWithNav
              modalRef={bottomSheetRef}
              screenList={bottomSheetScreen}
              snapPoints={{
                ios: ['60%'],
                android: ['60%']
              }}
            />
          )}
      </ThemedScrollView>
    </View>
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
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false)
  const onBreakdownPress = (): void => {
    setIsBreakdownExpanded(!isBreakdownExpanded)
  }
  const lockedToken = useTokenLockedBalance({ symbol: token.symbol }) as LockedBalance ?? { amount: new BigNumber(0), tokenValue: new BigNumber(0) }
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))
  const collateralTokens = useSelector((state: RootState) => state.loans.collateralTokens)

  const hasLockedBalance = useMemo((): boolean => {
    return collateralTokens.some(collateralToken => collateralToken.token.displaySymbol === token.displaySymbol)
  }, [token])

  return (
    <ThemedView
      dark={tailwind('bg-gray-800')}
      light={tailwind('bg-white')}
      style={tailwind('p-4 pb-0 rounded-lg')}
    >
      <ThemedTouchableOpacity
        onPress={onPress}
        dark={tailwind('border-0')}
        light={tailwind('border-0')}
        style={tailwind('flex-row justify-between items-center mb-4')}
        testID={testID}
      >
        <View style={tailwind('flex-row items-center flex-grow')}>
          <Icon testID={`${testID}_icon`} />
          <TokenNameText displaySymbol={token.displaySymbol} name={token.name} testID={testID} />
          <TokenAmountText
            tokenAmount={lockedToken.amount.plus(token.amount).toFixed(8)}
            usdAmount={lockedToken.tokenValue.plus(token.usdAmount)}
            testID={testID}
            isBalancesDisplayed={isBalancesDisplayed}
          />
        </View>
      </ThemedTouchableOpacity>

      {hasLockedBalance &&
        (
          <>
            <TokenBreakdownPercentage
              symbol={token.symbol}
              availableAmount={new BigNumber(token.amount)}
              onBreakdownPress={onBreakdownPress}
              isBreakdownExpanded={isBreakdownExpanded}
              lockedAmount={lockedToken.amount}
              testID={token.displaySymbol}
            />
            {isBreakdownExpanded && (
              <ThemedView
                light={tailwind('border-t border-gray-100')}
                dark={tailwind('border-t border-gray-700')}
                style={tailwind('pt-2 pb-4')}
              >
                <TokenBreakdownDetails
                  hasFetchedToken={hasFetchedToken}
                  lockedAmount={lockedToken.amount}
                  lockedValue={lockedToken.tokenValue}
                  availableAmount={new BigNumber(token.amount)}
                  availableValue={token.usdAmount}
                  testID={token.displaySymbol}
                />
              </ThemedView>
            )}
          </>
        )}
    </ThemedView>
  )
}

function BalanceActionSection ({ navigation, isZeroBalance }: { navigation: StackNavigationProp<BalanceParamList>, isZeroBalance: boolean }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row mb-4 mx-4')}>
      <BalanceActionButton type='SEND' onPress={() => navigation.navigate('Send')} disabled={isZeroBalance} />
      <BalanceActionButton type='RECEIVE' onPress={() => navigation.navigate('Receive')} />
    </View>
  )
}

type BalanceActionButtonType = 'SEND' | 'RECEIVE'
function BalanceActionButton ({ type, onPress, disabled }: { type: BalanceActionButtonType, onPress: () => void, disabled?: boolean }): JSX.Element {
  return (
    <IconButton
      iconName={type === 'SEND' ? 'arrow-upward' : 'arrow-downward'}
      iconSize={20}
      iconType='MaterialIcons'
      onPress={onPress}
      testID={type === 'SEND' ? 'send_balance_button' : 'receive_balance_button'}
      style={tailwind('flex-1 flex-row justify-center items-center rounded-lg py-2 border-0', { 'mr-1': type === 'SEND', 'ml-1': type === 'RECEIVE' })}
      textStyle={tailwind('text-base')}
      themedProps={{
        light: tailwind('bg-white'),
        dark: tailwind('bg-gray-800')
      }}
      disabledThemedProps={{
        light: tailwind('bg-gray-100'),
        dark: tailwind('bg-gray-800')
      }}
      iconLabel={translate('screens/BalancesScreen', type)}
      disabled={disabled}
    />
  )
}
