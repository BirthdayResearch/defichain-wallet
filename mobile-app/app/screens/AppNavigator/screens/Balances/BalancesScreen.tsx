import { ThemedScrollView } from '@components/themed'
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
import { RootState } from '@store'
import { useTokenPrice } from './hooks/TokenPrice'
import { TotalPortfolio } from './components/TotalPortfolio'
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
  const { wallets } = useWalletPersistenceContext()
  const lockedTokens = useTokenLockedBalance({}) as Map<string, LockedBalance>
  const {
    isBalancesDisplayed,
    toggleDisplayBalances: onToggleDisplayBalances
  } = useDisplayBalancesContext()
  const blockCount = useSelector((state: RootState) => state.block.count)
  const vaults = useSelector((state: RootState) => activeVaultsSelector(state.loans))

  const dispatch = useDispatch()
  const { getTokenPrice } = useTokenPrice()
  const [refreshing, setRefreshing] = useState(false)
  const [isZeroBalance, setIsZeroBalance] = useState(true)
  const { hasFetchedToken } = useSelector((state: RootState) => (state.wallet))

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

  const [filteredTokens, setFilteredTokens] = useState(dstTokens)

  // tab items
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.AllTokens)
  const handleButtonFilter = useCallback((buttonGroupTabKey: ButtonGroupTabKey) => {
    const filterTokens = dstTokens.filter((dstToken) => {
      switch (buttonGroupTabKey) {
        case ButtonGroupTabKey.LPTokens:
          return dstToken.isLPS
        case ButtonGroupTabKey.Crypto:
          return dstToken.isDAT && !dstToken.isLoanToken && !dstToken.isLPS
        case ButtonGroupTabKey.dTokens:
          return dstToken.isLoanToken
        // for All token tab will return true for list of dstToken
        default:
          return true
      }
    })
    setFilteredTokens(filterTokens)
  }, [dstTokens])

  const totalLockedUSDValue = useMemo(() => {
    if (lockedTokens === undefined) {
      return new BigNumber(0)
    }
    return [...lockedTokens.values()]
      .reduce((totalLockedUSDValue: BigNumber, value: LockedBalance) =>
          totalLockedUSDValue.plus(value.tokenValue.isNaN() ? 0 : value.tokenValue),
        new BigNumber(0))
  }, [lockedTokens])

  const totalLoansUSDValue = useMemo(() => {
    if (vaults === undefined) {
      return new BigNumber(0)
    }
    return vaults
      .reduce((totalLoansUSDValue: BigNumber, vault: LoanVaultActive) =>
          totalLoansUSDValue.plus(new BigNumber(vault.loanValue).isNaN() ? 0 : new BigNumber(vault.loanValue)),
        new BigNumber(0))
  }, [vaults])

  // to update filter list from selected tab
  useEffect(() => {
    handleButtonFilter(activeButtonGroup)
  }, [activeButtonGroup, dstTokens])

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
          totalLoansUSDValue={totalLoansUSDValue}
          onToggleDisplayBalances={onToggleDisplayBalances}
          isBalancesDisplayed={isBalancesDisplayed}
        />
        <BalanceActionSection navigation={navigation} isZeroBalance={isZeroBalance} />
        <DFIBalanceCard />
        {!hasFetchedToken
          ? (
            <View style={tailwind('p-4')}>
              <SkeletonLoader row={2} screen={SkeletonLoaderScreen.Balance} />
            </View>
          )
          : (<BalanceCard
              isZeroBalance={isZeroBalance}
              dstTokens={dstTokens}
              filteredTokens={filteredTokens}
              navigation={navigation}
              buttonGroupOptions={{
              activeButtonGroup: activeButtonGroup,
              setActiveButtonGroup: setActiveButtonGroup,
              onButtonGroupPress: handleButtonFilter
            }}
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
