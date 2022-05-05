
import { useScrollToTop } from '@react-navigation/native'
import { ThemedScrollView } from '@components/themed'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { ocean } from '@store/ocean'
import { dexPricesSelectorByDenomination, fetchDexPrice, fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { BalanceParamList } from './BalancesNavigator'
import { Announcements } from '@screens/AppNavigator/screens/Balances/components/Announcements'
import { DFIBalanceCard } from '@screens/AppNavigator/screens/Balances/components/DFIBalanceCard'
import { translate } from '@translations'
import { Platform, RefreshControl, View } from 'react-native'
import { RootState } from '@store'
import { useTokenPrice } from './hooks/TokenPrice'
import { PortfolioButtonGroupTabKey, TotalPortfolio } from './components/TotalPortfolio'
import { LockedBalance, useTokenLockedBalance } from './hooks/TokenLockedBalance'
import { AddressSelectionButton } from './components/AddressSelectionButton'
import { HeaderSettingButton } from './components/HeaderSettingButton'
import { IconButton } from '@components/IconButton'
import { BottomSheetAddressDetail } from './components/BottomSheetAddressDetail'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { activeVaultsSelector, fetchCollateralTokens, fetchVaults } from '@store/loans'
import { CreateOrEditAddressLabelForm } from './components/CreateOrEditAddressLabelForm'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { BalanceCard, ButtonGroupTabKey } from './components/BalanceCard'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { useDenominationCurrency } from './hooks/PortfolioCurrency'

type Props = StackScreenProps<BalanceParamList, 'BalancesScreen'>

export interface BalanceRowToken extends WalletToken {
  usdAmount: BigNumber
}

export function BalancesScreen ({ navigation }: Props): JSX.Element {
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const {
    address,
    addressLength
  } = useWalletContext()
  const {
    denominationCurrency,
    setDenominationCurrency
  } = useDenominationCurrency()

  const { getTokenPrice } = useTokenPrice(denominationCurrency)
  const prices = useSelector((state: RootState) => dexPricesSelectorByDenomination(state.wallet, denominationCurrency))
  const { wallets } = useWalletPersistenceContext()
  const lockedTokens = useTokenLockedBalance({ denominationCurrency }) as Map<string, LockedBalance>
  const {
    isBalancesDisplayed,
    toggleDisplayBalances: onToggleDisplayBalances
  } = useDisplayBalancesContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const vaults = useSelector((state: RootState) => activeVaultsSelector(state.loans))

  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false)
  const [isZeroBalance, setIsZeroBalance] = useState(true)
  const { hasFetchedToken, allTokens } = useSelector((state: RootState) => (state.wallet))
  const ref = useRef(null)
  useScrollToTop(ref)

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
        <View style={tailwind('mr-2')}>
          <AddressSelectionButton address={address} addressLength={addressLength} onPress={expandModal} hasCount />
        </View>
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
      dispatch(fetchVaults({
        client,
        address
      }))
    })
  }

  useEffect(() => {
    dispatch(fetchDexPrice({ client, denomination: denominationCurrency }))
  }, [blockCount, denominationCurrency])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    fetchPortfolioData()
    setRefreshing(false)
  }, [address, client, dispatch])

  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  // TODO: Check if this is needed for recalculation with change of denominationCurrency
  // const prices = useSelector((state: RootState) => dexPricesSelectorByDenomination(state.wallet, denominationCurrency))
  const {
    totalAvailableValue,
    dstTokens
  } = useMemo(() => {
    return tokens.reduce(
      ({
        totalAvailableValue,
        dstTokens
      }: { totalAvailableValue: BigNumber, dstTokens: BalanceRowToken[] },
        token
      ) => {
        const usdAmount = getTokenPrice(token.symbol, new BigNumber(token.amount), token.isLPS)
        if (token.symbol === 'DFI') {
          return {
            // `token.id === '0_unified'` to avoid repeated DFI price to get added in totalAvailableValue
            totalAvailableValue: token.id === '0_unified'
              ? totalAvailableValue
              : totalAvailableValue.plus(usdAmount.isNaN() ? 0 : usdAmount),
            dstTokens
          }
        }
        return {
          totalAvailableValue: totalAvailableValue.plus(usdAmount.isNaN() ? 0 : usdAmount),
          dstTokens: [...dstTokens, {
            ...token,
            usdAmount
          }]
        }
      }, {
      totalAvailableValue: new BigNumber(0),
      dstTokens: []
    })
  }, [prices, tokens])

  // add token that are 100% locked as collateral into dstTokens
  const combinedTokens = useMemo(() => {
    if (lockedTokens === undefined || lockedTokens.size === 0) {
      return dstTokens
    }

    const dstTokenSymbols = dstTokens.map(token => token.displaySymbol)
    const lockedTokensArray: BalanceRowToken[] = []
    lockedTokens.forEach((_lockedBalance, displaySymbol) => {
      if (displaySymbol === 'DFI') {
        return
      }

      const tokenExist = dstTokenSymbols.includes(displaySymbol)
      if (!tokenExist) {
        const tokenData = allTokens[displaySymbol]
        if (tokenData !== undefined) {
          lockedTokensArray.push({
            id: tokenData.id,
            amount: '0',
            symbol: tokenData.symbol,
            displaySymbol: tokenData.displaySymbol,
            symbolKey: tokenData.symbolKey,
            name: tokenData.name,
            isDAT: tokenData.isDAT,
            isLPS: tokenData.isLPS,
            isLoanToken: tokenData.isLoanToken,
            avatarSymbol: tokenData.displaySymbol,
            usdAmount: new BigNumber(0)
          })
        }
      }
    })
    return [...dstTokens, ...lockedTokensArray]
  }, [dstTokens, allTokens, lockedTokens])

  // portfolio tab items
  const onPortfolioButtonGroupChange = (portfolioButtonGroupTabKey: PortfolioButtonGroupTabKey): void => {
    setDenominationCurrency(portfolioButtonGroupTabKey)
  }

  const portfolioButtonGroup = [
    {
      id: PortfolioButtonGroupTabKey.USDT,
      // api is saved as USDT, but will display in USD on app
      label: translate('screens/TotalPortfolio', 'USD'),
      handleOnPress: () => onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.USDT)
    },
    {
      id: PortfolioButtonGroupTabKey.DFI,
      label: translate('screens/BalancesScreen', 'DFI'),
      handleOnPress: () => onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.DFI)
    },
    {
      id: PortfolioButtonGroupTabKey.BTC,
      label: translate('screens/BalancesScreen', 'BTC'),
      handleOnPress: () => onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.BTC)
    }
  ]

  // token tab items
  const [filteredTokens, setFilteredTokens] = useState(combinedTokens)
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.AllTokens)
  const handleButtonFilter = useCallback((buttonGroupTabKey: ButtonGroupTabKey) => {
    const filterTokens = combinedTokens.filter((token) => {
      switch (buttonGroupTabKey) {
        case ButtonGroupTabKey.LPTokens:
          return token.isLPS
        case ButtonGroupTabKey.Crypto:
          return token.isDAT && !token.isLoanToken && !token.isLPS
        case ButtonGroupTabKey.dTokens:
          return token.isLoanToken
        // for All token tab will return true for list of dstToken
        default:
          return true
      }
    })
    setFilteredTokens(filterTokens)
  }, [combinedTokens])

  const totalLockedValue = useMemo(() => {
    if (lockedTokens === undefined) {
      return new BigNumber(0)
    }
    return [...lockedTokens.values()]
      .reduce((totalLockedValue: BigNumber, value: LockedBalance) =>
        totalLockedValue.plus(value.tokenValue.isNaN() ? 0 : value.tokenValue),
        new BigNumber(0))
  }, [lockedTokens, prices])

  const totalLoansValue = useMemo(() => {
    if (vaults === undefined) {
      return new BigNumber(0)
    }
    return vaults
      .reduce((totalLoansValue: BigNumber, vault: LoanVaultActive) => {
        const totalVaultLoansValue = vault.loanAmounts.reduce((totalVaultLoansValue, loanToken) => {
          const tokenValue = getTokenPrice(loanToken.symbol, new BigNumber(loanToken.amount))
          return totalVaultLoansValue.plus(new BigNumber(tokenValue).isNaN() ? 0 : tokenValue)
        }, new BigNumber(0))
        return totalLoansValue.plus(new BigNumber(totalVaultLoansValue).isNaN() ? 0 : totalVaultLoansValue)
      }, new BigNumber(0))
  }, [prices, vaults])

  // to update filter list from selected token tab
  useEffect(() => {
    handleButtonFilter(activeButtonGroup)
  }, [activeButtonGroup, combinedTokens])

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
  const modalSnapPoints = { ios: ['75%'], android: ['75%'] }
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
            screenName: 'CreateOrEditAddressLabelForm'
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
  }, [address, isLight])

  return (
    <View ref={containerRef} style={tailwind('flex-1')}>
      <ThemedScrollView
        ref={ref}
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
          totalAvailableValue={totalAvailableValue}
          totalLockedValue={totalLockedValue}
          totalLoansValue={totalLoansValue}
          onToggleDisplayBalances={onToggleDisplayBalances}
          isBalancesDisplayed={isBalancesDisplayed}
          portfolioButtonGroupOptions={{
            activePortfolioButtonGroup: denominationCurrency,
            setActivePortfolioButtonGroup: setDenominationCurrency
          }}
          portfolioButtonGroup={portfolioButtonGroup}
          denominationCurrency={denominationCurrency}
        />
        <BalanceActionSection navigation={navigation} isZeroBalance={isZeroBalance} />
        <DFIBalanceCard denominationCurrency={denominationCurrency} />
        {!hasFetchedToken
          ? (
            <View style={tailwind('p-4')}>
              <SkeletonLoader row={2} screen={SkeletonLoaderScreen.Balance} />
            </View>
          )
          : (<BalanceCard
              isZeroBalance={isZeroBalance}
              dstTokens={combinedTokens}
              filteredTokens={filteredTokens}
              navigation={navigation}
              buttonGroupOptions={{
              activeButtonGroup: activeButtonGroup,
              setActiveButtonGroup: setActiveButtonGroup,
              onButtonGroupPress: handleButtonFilter
            }}
              denominationCurrency={denominationCurrency}
             />)}
        {Platform.OS === 'web'
          ? (
            <BottomSheetWebWithNav
              modalRef={containerRef}
              screenList={bottomSheetScreen}
              isModalDisplayed={isModalDisplayed}
              modalStyle={{
                position: 'absolute',
                bottom: '0',
                height: '505px',
                width: '375px',
                zIndex: 50
              }}
            />
          )
          : (
            <BottomSheetWithNav
              modalRef={bottomSheetRef}
              screenList={bottomSheetScreen}
              snapPoints={modalSnapPoints}
            />
          )}
      </ThemedScrollView>
    </View>
  )
}

function BalanceActionSection ({
  navigation,
  isZeroBalance
}: { navigation: StackNavigationProp<BalanceParamList>, isZeroBalance: boolean }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row mb-4 mx-4')}>
      <BalanceActionButton type='SEND' onPress={() => navigation.navigate('Send')} disabled={isZeroBalance} />
      <BalanceActionButton type='RECEIVE' onPress={() => navigation.navigate('Receive')} />
    </View>
  )
}

type BalanceActionButtonType = 'SEND' | 'RECEIVE'

function BalanceActionButton ({
  type,
  onPress,
  disabled
}: { type: BalanceActionButtonType, onPress: () => void, disabled?: boolean }): JSX.Element {
  return (
    <IconButton
      iconName={type === 'SEND' ? 'arrow-upward' : 'arrow-downward'}
      iconSize={20}
      iconType='MaterialIcons'
      onPress={onPress}
      testID={type === 'SEND' ? 'send_balance_button' : 'receive_balance_button'}
      style={tailwind('flex-1 flex-row justify-center items-center rounded-lg py-2 border-0', {
        'mr-1': type === 'SEND',
        'ml-1': type === 'RECEIVE'
      })}
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
