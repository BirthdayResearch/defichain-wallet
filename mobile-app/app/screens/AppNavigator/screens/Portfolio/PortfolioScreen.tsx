import { useIsFocused, useScrollToTop } from '@react-navigation/native'
import { ThemedIcon, ThemedScrollViewV2, ThemedText, ThemedTouchableOpacity, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { useDisplayBalancesContext } from '@contexts/DisplayBalancesContext'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useWalletPersistenceContext } from '@shared-contexts/WalletPersistenceContext'
import { useWhaleApiClient, useWhaleRpcClient } from '@shared-contexts/WhaleContext'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { ocean } from '@store/ocean'
import { dexPricesSelectorByDenomination, fetchDexPrice, fetchTokens, tokensSelector, WalletToken } from '@store/wallet'
import { tailwind } from '@tailwind'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { batch, useSelector } from 'react-redux'
import { PortfolioParamList } from './PortfolioNavigator'
import { Announcements } from '@screens/AppNavigator/screens/Portfolio/components/Announcements'
import { DFIBalanceCard } from '@screens/AppNavigator/screens/Portfolio/components/DFIBalanceCard'
import { translate } from '@translations'
import { Platform, RefreshControl, View, TouchableOpacity } from 'react-native'
import { RootState } from '@store'
import { useTokenPrice } from './hooks/TokenPrice'
import { PortfolioButtonGroupTabKey, TotalPortfolio } from './components/TotalPortfolio'
import { LockedBalance, useTokenLockedBalance } from './hooks/TokenLockedBalance'
import { IconButton } from '@components/IconButton'
import { BottomSheetAddressDetail } from './components/BottomSheetAddressDetail'
import { BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { activeVaultsSelector, fetchCollateralTokens, fetchLoanTokens, fetchVaults } from '@store/loans'
import { CreateOrEditAddressLabelForm } from './components/CreateOrEditAddressLabelForm'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { PortfolioCard, ButtonGroupTabKey } from './components/PortfolioCard'
import { SkeletonLoader, SkeletonLoaderScreen } from '@components/SkeletonLoader'
import { LoanVaultActive } from '@defichain/whale-api-client/dist/api/loan'
import { fetchExecutionBlock, fetchFutureSwaps, hasFutureSwap } from '@store/futureSwap'
import { useDenominationCurrency } from './hooks/PortfolioCurrency'
import { BottomSheetAssetSortList, PortfolioSortType } from './components/BottomSheetAssetSortList'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { AddressSelectionButtonV2 } from './components/AddressSelectionButtonV2'

type Props = StackScreenProps<PortfolioParamList, 'PortfolioScreen'>

export interface PortfolioRowToken extends WalletToken {
  usdAmount: BigNumber
}

export function PortfolioScreen ({ navigation }: Props): JSX.Element {
  const { isLight } = useThemeContext()
  const isFocused = useIsFocused()
  const height = useBottomTabBarHeight()
  const client = useWhaleApiClient()
  const whaleRpcClient = useWhaleRpcClient()
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

  const dispatch = useAppDispatch()
  const [refreshing, setRefreshing] = useState(false)
  const [isZeroBalance, setIsZeroBalance] = useState(true)
  const hasPendingFutureSwap = useSelector((state: RootState) => hasFutureSwap(state.futureSwaps))
  const {
    hasFetchedToken,
    allTokens
  } = useSelector((state: RootState) => (state.wallet))
  const ref = useRef(null)
  useScrollToTop(ref)

  useEffect(() => {
    dispatch(ocean.actions.setHeight(height))
  }, [height, wallets])

  useEffect(() => {
    if (isFocused) {
      batch(() => {
        dispatch(fetchFutureSwaps({
          client: whaleRpcClient,
          address
        }))
        dispatch(fetchExecutionBlock({ client: whaleRpcClient }))
      })
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    batch(() => {
      // fetch only once to decide flag to display locked balance breakdown
      dispatch(fetchCollateralTokens({ client }))
      dispatch(fetchLoanTokens({ client }))
    })
  }, [])

  const fetchPortfolioData = (): void => {
    batch(() => {
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

  // TODO: check if can reduce API calls. Already being called on WalletDataProvider
  // But doesn't use the denominationCurrency
  useEffect(() => {
    dispatch(fetchDexPrice({
      client,
      denomination: denominationCurrency
    }))
  }, [blockCount, denominationCurrency])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    fetchPortfolioData()
    setRefreshing(false)
  }, [address, client, dispatch])

  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const {
    totalAvailableValue,
    dstTokens
  } = useMemo(() => {
    return tokens.reduce(
      ({
        totalAvailableValue,
        dstTokens
      }: { totalAvailableValue: BigNumber, dstTokens: PortfolioRowToken[] },
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
    const lockedTokensArray: PortfolioRowToken[] = []
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

  const [filteredTokens, setFilteredTokens] = useState(combinedTokens)

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
      label: translate('screens/PortfolioScreen', 'DFI'),
      handleOnPress: () => onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.DFI)
    },
    {
      id: PortfolioButtonGroupTabKey.BTC,
      label: translate('screens/PortfolioScreen', 'BTC'),
      handleOnPress: () => onPortfolioButtonGroupChange(PortfolioButtonGroupTabKey.BTC)
    }
  ]

  // Asset sort bottom sheet list
  const [assetSortType, setAssetSortType] = useState<PortfolioSortType>(PortfolioSortType.HighestDenominationValue) // to display selected sorted type text
  const [isSorted, setIsSorted] = useState<boolean>(false) // to display acsending/descending icon
  const [hideIcon, setHideIcon] = useState(false)
  const [showAssetSortBottomSheet, setShowAssetSortBottomSheet] = useState(false)
  const modifiedDenominationCurrency = useMemo(() => denominationCurrency === 'USDT' ? 'USD' : denominationCurrency, [denominationCurrency])
  const sortTokensAssetOnType = useCallback((assetSortType: PortfolioSortType): PortfolioRowToken[] => {
    let sortTokensFunc: (a: PortfolioRowToken, b: PortfolioRowToken) => number
    switch (assetSortType) {
      case (PortfolioSortType.HighestDenominationValue):
        sortTokensFunc = (a, b) => b.usdAmount.minus(a.usdAmount).toNumber()
        break
      case (PortfolioSortType.LowestDenominationValue):
        sortTokensFunc = (a, b) => a.usdAmount.minus(b.usdAmount).toNumber()
        break
      case (PortfolioSortType.HighestTokenAmount):
        sortTokensFunc = (a, b) => new BigNumber(b.amount).minus(new BigNumber(a.amount)).toNumber()
        break
      case (PortfolioSortType.LowestTokenAmount):
        sortTokensFunc = (a, b) => new BigNumber(a.amount).minus(new BigNumber(b.amount)).toNumber()
        break
      case (PortfolioSortType.AtoZ):
        sortTokensFunc = (a, b) => a.symbol.localeCompare(b.symbol)
        break
      case (PortfolioSortType.ZtoA):
        sortTokensFunc = (a, b) => b.symbol.localeCompare(a.symbol)
        break
      default:
        sortTokensFunc = (a, b) => b.usdAmount.minus(a.usdAmount).toNumber()
    }

    return filteredTokens.sort(sortTokensFunc)
  }, [filteredTokens, assetSortType, denominationCurrency])

  useEffect(() => {
    setAssetSortType(PortfolioSortType.HighestDenominationValue) // reset sorting state upon denominationCurrency change
  }, [denominationCurrency])

  // conditions to display sort icons
  useEffect(() => {
    if (assetSortType.includes('Lowest')) {
      setIsSorted(true)
    } else if (assetSortType.includes('A to Z') || assetSortType.includes('Z to A')) {
      setHideIcon(true)
    } else {
      setIsSorted(false)
      setHideIcon(false)
    }
  }, [assetSortType])

  // token tab items
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

  const assetSortBottomSheetScreen = useMemo(() => {
    return [
      {
        stackScreenName: 'AssetSortList',
        component: BottomSheetAssetSortList({
          headerLabel: translate('screens/PortfolioScreen', 'Sort assets by'),
          onCloseButtonPress: () => {
            setShowAssetSortBottomSheet(false)
            dismissModal(true)
          },
          onButtonPress: (item: PortfolioSortType) => {
            setAssetSortType(item)
            sortTokensAssetOnType(item)
            setShowAssetSortBottomSheet(false)
            dismissModal(true)
          },
          modifiedDenominationCurrency,
          selectedAssetSortType: assetSortType
        }),
        option: {
          headerStatusBarHeight: 1,
          headerBackgroundContainerStyle: tailwind('border-b', {
            'border-gray-200': isLight,
            'border-gray-700': !isLight,
            '-top-5': Platform.OS !== 'web'
          }),
          header: () => null,
          headerBackTitleVisible: false
        }
      }
    ]
  }, [modifiedDenominationCurrency, assetSortType])

  // Address selection bottom sheet
  const bottomSheetRef = useRef<BottomSheetModalMethods>(null)
  const bottomSheetSortRef = useRef<BottomSheetModalMethods>(null)
  const containerRef = useRef(null)
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const modalSnapPoints = { ios: ['75%'], android: ['75%'] }
  const modalSortingSnapPoints = { ios: ['55%'], android: ['55%'] }
  const expandModal = useCallback((isSortBottomSheet: boolean) => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(true)
    } else {
      isSortBottomSheet
        ? bottomSheetSortRef.current?.present()
        : bottomSheetRef.current?.present()
    }
  }, [])
  const dismissModal = useCallback((isSortBottomSheet: boolean) => {
    if (Platform.OS === 'web') {
      setIsModalDisplayed(false)
    } else {
      isSortBottomSheet
        ? bottomSheetSortRef.current?.close()
        : bottomSheetRef.current?.close()
    }
  }, [])

  const addressBottomSheetScreen = useMemo(() => {
    return [
      {
        stackScreenName: 'AddressDetail',
        component: BottomSheetAddressDetail({
          address: address,
          addressLabel: 'TODO: get label from storage api',
          onReceiveButtonPress: () => {
            dismissModal(false)
            navigation.navigate('Receive')
          },
          onTransactionsButtonPress: () => {
            dismissModal(false)
            navigation.navigate('TransactionsScreen')
          },
          onCloseButtonPress: () => dismissModal(false),
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
      <ThemedScrollViewV2
        ref={ref}
        light={tailwind('bg-gray-50')}
        contentContainerStyle={tailwind('pb-8')} testID='portfolio_list'
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        }
      >
        <ThemedViewV2
          light={tailwind('bg-mono-light-v2-00')}
          dark={tailwind('bg-mono-dark-v2-00')}
          style={tailwind('px-5 flex flex-row items-center')}
        >
          <AddressSelectionButtonV2 address={address} addressLength={addressLength} onPress={() => expandModal(false)} />
          <ThemedTouchableOpacityV2
            testID='toggle_balance'
            style={tailwind('ml-2')}
            light={tailwind('bg-transparent')}
            dark={tailwind('bg-transparent')}
            onPress={onToggleDisplayBalances}
          >
            <ThemedIcon
              iconType='MaterialCommunityIcons'
              dark={tailwind('text-mono-dark-v2-900')}
              light={tailwind('text-mono-light-v2-900')}
              name={`${isBalancesDisplayed ? 'eye' : 'eye-off'}`}
              size={18}
              testID='toggle_usd_breakdown_icon'
            />
          </ThemedTouchableOpacityV2>
        </ThemedViewV2>
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
        {hasPendingFutureSwap && <FutureSwapCta navigation={navigation} />}
        {/* to show bottom sheet for asset sort */}
        <AssetSortRow
          assetSortType={assetSortType}
          onPress={() => {
            setShowAssetSortBottomSheet(true)
            expandModal(true)
          }}
          isSorted={isSorted}
          hideIcon={hideIcon}
          modifiedDenominationCurrency={modifiedDenominationCurrency}
        />
        <DFIBalanceCard denominationCurrency={denominationCurrency} />
        {!hasFetchedToken
          ? (
            <View style={tailwind('p-4')}>
              <SkeletonLoader row={2} screen={SkeletonLoaderScreen.Portfolio} />
            </View>
          )
          : (<PortfolioCard
              isZeroBalance={isZeroBalance}
              dstTokens={combinedTokens}
              filteredTokens={sortTokensAssetOnType(assetSortType)}
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
              screenList={showAssetSortBottomSheet ? assetSortBottomSheetScreen : addressBottomSheetScreen}
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
            <>
              <BottomSheetWithNav
                modalRef={bottomSheetSortRef}
                screenList={assetSortBottomSheetScreen}
                snapPoints={modalSortingSnapPoints}
              />
              <BottomSheetWithNav
                modalRef={bottomSheetRef}
                screenList={addressBottomSheetScreen}
                snapPoints={modalSnapPoints}
              />
            </>
          )}
      </ThemedScrollViewV2>
    </View>
  )
}

function BalanceActionSection ({
  navigation,
  isZeroBalance
}: { navigation: StackNavigationProp<PortfolioParamList>, isZeroBalance: boolean }): JSX.Element {
  return (
    <View style={tailwind('flex flex-row mx-4')}>
      <BalanceActionButton type='SEND' onPress={() => navigation.navigate('Send')} disabled={isZeroBalance} />
      <BalanceActionButton type='RECEIVE' onPress={() => navigation.navigate('Receive')} />
    </View>
  )
}

function FutureSwapCta ({
  navigation
}: { navigation: StackNavigationProp<PortfolioParamList> }): JSX.Element {
  return (
    <ThemedTouchableOpacity
      onPress={() => navigation.navigate('FutureSwapScreen')}
      style={tailwind('flex flex-row p-2 mt-2 mx-4 items-center border-0 rounded-3xl justify-between')}
      light={tailwind('bg-blue-100')}
      dark={tailwind('bg-darkblue-50')}
      testID='pending_future_swaps'
    >
      <View style={tailwind('flex flex-row items-center flex-1')}>
        <ThemedIcon
          iconType='MaterialIcons'
          name='info'
          size={16}
          light={tailwind('text-blue-500')}
          dark={tailwind('text-darkblue-500')}
        />
        <ThemedText
          style={tailwind('ml-2 text-sm')}
          light={tailwind('text-gray-400')}
          dark={tailwind('text-gray-500')}
        >
          {translate('screens/PortfolioScreen', 'You have pending future swap(s)')}
        </ThemedText>
      </View>
      <ThemedIcon
        iconType='MaterialCommunityIcons'
        name='chevron-right'
        size={16}
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
      />

    </ThemedTouchableOpacity>
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
      iconLabel={translate('screens/PortfolioScreen', type)}
      disabled={disabled}
    />
  )
}

function AssetSortRow (props: { hideIcon: boolean, isSorted: boolean, assetSortType: PortfolioSortType, modifiedDenominationCurrency: string, onPress: () => void }): JSX.Element {
  const highestCurrencyValue = translate('screens/PortfolioScreen', 'Highest {{modifiedDenominationCurrency}} value', { modifiedDenominationCurrency: props.modifiedDenominationCurrency })
  const lowestCurrencyValue = translate('screens/PortfolioScreen', 'Lowest {{modifiedDenominationCurrency}} value', { modifiedDenominationCurrency: props.modifiedDenominationCurrency })
  const getDisplayedSortText = useCallback((text: PortfolioSortType): string => {
    if (text === PortfolioSortType.HighestDenominationValue) {
      return highestCurrencyValue
    } else if (text === PortfolioSortType.LowestDenominationValue) {
      return lowestCurrencyValue
    }
    return text
  }, [props.modifiedDenominationCurrency])

  return (
    <View
      style={tailwind('px-4 flex flex-row justify-between pt-5')}
      testID='toggle_sorting_assets'
    >
      <ThemedText
        style={tailwind('text-xs text-gray-400 pr-1')}
        light={tailwind('text-gray-500')}
        dark={tailwind('text-gray-400')}
      >
        {translate('screens/PortfolioScreen', 'AVAILABLE ASSETS')}
      </ThemedText>
      <TouchableOpacity
        style={tailwind('flex flex-row items-center')}
        onPress={props.onPress}
        testID='your_assets_dropdown_arrow'
      >
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs font-medium')}
        >
          {translate('screens/PortfolioScreen', getDisplayedSortText(props.assetSortType))}
        </ThemedText>
        {!props.hideIcon && (
          <ThemedIcon
            style={tailwind('ml-1 font-medium')}
            light={tailwind('text-gray-500')}
            dark={tailwind('text-gray-400')}
            iconType='MaterialCommunityIcons'
            name={!props.isSorted ? 'sort-variant' : 'sort-reverse-variant'}
            size={16}
          />
        )}
        <ThemedIcon
          light={tailwind('text-primary-500')}
          dark={tailwind('text-darkprimary-500')}
          iconType='MaterialIcons'
          name='arrow-drop-down'
          size={16}
        />
      </TouchableOpacity>
    </View>
  )
}
