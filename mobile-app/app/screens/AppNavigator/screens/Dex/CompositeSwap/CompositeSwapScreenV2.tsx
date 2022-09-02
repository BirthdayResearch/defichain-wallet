import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { Platform, TouchableOpacity, View, TextInput } from 'react-native'
import { useSelector } from 'react-redux'
import { Control, Controller, useForm } from 'react-hook-form'
import BigNumber from 'bignumber.js'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { tailwind, getColor } from '@tailwind'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { translate } from '@translations'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { DFITokenSelector, DFIUtxoSelector, tokensSelector } from '@store/wallet'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient, useWhaleRpcClient } from '@shared-contexts/WhaleContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { StackScreenProps } from '@react-navigation/stack'
import {
  ThemedIcon,
  ThemedScrollViewV2,
  ThemedText,
  ThemedTouchableOpacity,
  ThemedView,
  ThemedViewV2,
  ThemedTextV2,
  ThemedTextInputV2,
  ThemedTouchableOpacityV2
} from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetToken, BottomSheetTokenList, TokenType } from '@components/BottomSheetTokenList'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { InfoRow, InfoType } from '@components/InfoRow'
import { InputHelperText } from '@components/InputHelperText'
import { NumberRow } from '@components/NumberRow'
import { SetAmountButton } from '@components/SetAmountButton'
import { WalletTextInput } from '@components/WalletTextInput'
// import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { SlippageError, SlippageTolerance } from './components/SlippageTolerance'
import { DexParamList } from '../DexNavigator'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useTokenBestPath } from '../../Portfolio/hooks/TokenBestPath'
import { useSlippageTolerance } from '../hook/SlippageTolerance'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useSwappableTokens } from '../hook/SwappableTokens'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
// import { ButtonGroup } from '../components/ButtonGroup'
import { useFutureSwap, useFutureSwapDate } from '../hook/FutureSwap'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
// import NumberFormat from 'react-number-format'
import { TextRow } from '@components/TextRow'
import { PricesSection } from '@components/PricesSection'
import { fetchExecutionBlock } from '@store/futureSwap'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { WalletAlert } from '@components/WalletAlert'
// import { AnnouncementBanner } from '../../Portfolio/components/Announcements'
import { DexStabilizationType, useDexStabilization } from '../hook/DexStabilization'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'
import { ButtonGroupV2 } from '../components/ButtonGroupV2'
import { ActiveUSDValueV2 } from '../../Loans/VaultDetail/components/ActiveUSDValueV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { TokenDropdownButton } from './components/TokenDropdownButton'
import { TransactionCard, AmountButtonTypes } from '@components/TransactionCard'
import { SlippageToleranceCard, SlippageAmountButtonTypes } from './components/SlippageToleranceCard'
import { WalletTextInputV2 } from '@components/WalletTextInputV2'
// import { ButtonV2 } from '@components/ButtonV2'
import { ScreenTabButton } from './components/ScreenTabButton'
import { useToast } from 'react-native-toast-notifications'
import NumberFormat from 'react-number-format'
import { PricesSectionV2, PriceRateProps } from '@components/PricesSectionV2'
import { NumberRowV2 } from '@components/NumberRowV2'
import { SwapSummary } from './components/SwapSummary'
import { WantSwapRow } from './components/WantSwapRow'
import { ButtonV2 } from '@components/ButtonV2'
import { useDisplayUtxoWarning } from '@hooks/wallet/DisplayUtxoWarning'
import { ViewSlippageToleranceInfo, ViewFeeBreakdownInfo, viewSettlementsInfo } from './components/ModalContent'
import { BottomSheetWebWithNavV2, BottomSheetWithNavV2 } from '@components/BottomSheetWithNavV2'
import { useBottomSheet } from '@hooks/useBottomSheet'
import { WantInfoText } from './components/WantInfoText'

export enum ButtonGroupTabKey {
  InstantSwap = 'INSTANT_SWAP',
  FutureSwap = 'FUTURE_SWAP'
}
export interface TokenState {
  id: string
  reserve: string
  displaySymbol: string
  symbol: string
}
export interface OwnedTokenState extends TokenState {
  amount: string
}

type Props = StackScreenProps<DexParamList, 'CompositeSwapScreen'>

export function CompositeSwapScreenV2 ({ route }: Props): JSX.Element {
  // Hooks
  const logger = useLogger()
  const client = useWhaleApiClient()
  const whaleRpcClient = useWhaleRpcClient()
  const isFocused = useIsFocused()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const dispatch = useAppDispatch()
  const { address } = useWalletContext()
  const {
    getArbitraryPoolPair,
    calculatePriceRates
  } = useTokenBestPath()
  const {
    slippage,
    setSlippage
  } = useSlippageTolerance()
  const { getTokenPrice } = useTokenPrice()
  const { isLight } = useThemeContext()
  const toast = useToast()
  const {
    bottomSheetRef,
    containerRef,
    expandModal,
    dismissModal,
    isModalDisplayed
  } = useBottomSheet()
  const { getDisplayUtxoWarningStatus } = useDisplayUtxoWarning()

  // Root state
  const blockCount = useSelector((state: RootState) => state.block.count ?? 0)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const executionBlock = useSelector((state: RootState) => state.futureSwaps.executionBlock)

  // Constant
  const reservedDfi = 0.1
  const TOAST_DURATION = 2000
  const modalSortingSnapPoints = { ios: ['40%'], android: ['40%'] }

  // Local state
  const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [slippageError, setSlippageError] = useState<SlippageError | undefined>()
  const [selectedTokenA, setSelectedTokenA] = useState<OwnedTokenState>()
  const [selectedTokenB, setSelectedTokenB] = useState<TokenState>()
  const [selectedPoolPairs, setSelectedPoolPairs] = useState<PoolPairData[]>()
  const [priceRates, setPriceRates] = useState<PriceRateProps[]>()
  const [isTokenModalDisplayed, setIsTokenModalDisplayed] = useState(false)
  const [isFromTokenSelectDisabled, setIsFromTokenSelectDisabled] = useState(false)
  const [isToTokenSelectDisabled, setIsToTokenSelectDisabled] = useState(false)
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.InstantSwap)
  const [isFutureSwap, setIsFutureSwap] = useState(false)

  const {
    timeRemaining,
    transactionDate,
    isEnded
  } = useFutureSwapDate(executionBlock, blockCount)
  const {
    fromTokens,
    toTokens
  } = useSwappableTokens(selectedTokenA?.id)
  const {
    isFutureSwapOptionEnabled,
    oraclePriceText,
    isSourceLoanToken
  } = useFutureSwap({
    fromTokenDisplaySymbol: selectedTokenA?.displaySymbol,
    toTokenDisplaySymbol: selectedTokenB?.displaySymbol
  })
  // const containerRef = useRef(null)
  const bottomSheetRefV1 = useRef<BottomSheetModal>(null) // temporary until joshua create the new token screen

  // dex stabilization
  const { isFeatureAvailable } = useFeatureFlagContext()
  const isDexStabilizationEnabled = isFeatureAvailable('dusd_dex_high_fee')
  const {
    dexStabilizationAnnouncement,
    dexStabilization: {
      dexStabilizationType,
      pair: dexStabilizationPair,
      dexStabilizationFee
    }
  } = useDexStabilization(selectedTokenA, selectedTokenB)

  const expandModalToken = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsTokenModalDisplayed(true)
    } else {
      bottomSheetRefV1.current?.present()
    }
  }, [])

  const dismissModalToken = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsTokenModalDisplayed(false)
    } else {
      bottomSheetRefV1.current?.close()
    }
  }, [])

  const onButtonGroupChange = (buttonGroupTabKey: ButtonGroupTabKey): void => {
    setActiveButtonGroup(buttonGroupTabKey)
  }

  // component UI state
  const {
    control,
    formState,
    setValue,
    getValues,
    trigger,
    watch
  } = useForm<{
    tokenA: string
    tokenB: string
  }>({ mode: 'onChange' })
  const {
    tokenA,
    tokenB
  } = watch()
  const tokenAAmount = getValues('tokenA')
  const tokenBAmount = getValues('tokenB')

  const {
    isConversionRequired,
    conversionAmount
  } = useConversion({
    inputToken: {
      type: selectedTokenA?.id === '0_unified' ? 'token' : 'others',
      amount: new BigNumber(tokenA)
    },
    deps: [tokenA, JSON.stringify(tokens)]
  })

  const getMaxAmount = (token: OwnedTokenState): string => {
    if (token.id !== '0_unified') {
      return new BigNumber(token.amount).toFixed(8)
    }

    const maxAmount = new BigNumber(token.amount).minus(reservedDfi)
    return maxAmount.isLessThanOrEqualTo(0) ? new BigNumber(0).toFixed(8) : maxAmount.toFixed(8)
  }

  const onTokenSelect = ({
    tokenId,
    reserve,
    token: {
      displaySymbol,
      symbol
    }
  }: BottomSheetToken, direction: 'FROM' | 'TO'): void => {
    const ownedToken = tokens?.find(token => token.id === tokenId)
    const derivedToken = {
      id: ownedToken !== undefined ? ownedToken.id : tokenId, // retrieve unified token if selected
      symbol,
      displaySymbol,
      reserve: reserve !== undefined ? new BigNumber(reserve).toFixed(8) : new BigNumber(0).toFixed(8)
    }

    if (direction === 'FROM') {
      setSelectedTokenA({
        ...derivedToken,
        amount: ownedToken === undefined ? '0' : ownedToken.amount
      })
      setActiveButtonGroup(ButtonGroupTabKey.InstantSwap)

      if (selectedTokenB !== undefined) {
        setSelectedTokenB(undefined)
        setValue('tokenA', '')
        setValue('tokenB', '')
      }
    } else {
      setSelectedTokenB(derivedToken)
    }
  }

  const onBottomSheetSelect = ({ direction }: { direction: 'FROM' | 'TO' }): void => {
    setBottomSheetScreen([
      {
        stackScreenName: 'TokenList',
        component: BottomSheetTokenList({
          tokens: direction === 'FROM' ? fromTokens ?? [] : toTokens ?? [],
          tokenType: TokenType.BottomSheetToken,
          headerLabel: translate('screens/CompositeSwapScreen', direction === 'FROM' ? 'Choose token for swap' : 'Choose token to swap'),
          onCloseButtonPress: () => dismissModalToken(),
          onTokenPress: (item): void => {
            onTokenSelect(item, direction)
            dismissModalToken()
          }
        }),
        option: {
          header: () => null
        }
      }])
    expandModalToken()
  }

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchExecutionBlock({ client: whaleRpcClient }))
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    if (route.params.pair?.id === undefined && route.params.fromToken === undefined) {
      return
    }

    const tokenSelectOption: DexParamList['CompositeSwapScreen']['tokenSelectOption'] = route.params.tokenSelectOption ?? {
      from: {
        isDisabled: true,
        isPreselected: true
      },
      to: {
        isDisabled: true,
        isPreselected: true
      }
    }

    setIsFromTokenSelectDisabled(tokenSelectOption.from.isDisabled)
    setIsToTokenSelectDisabled(tokenSelectOption.to.isDisabled)

    if (route.params.fromToken !== undefined) {
      onTokenSelect({
        tokenId: route.params.fromToken.id,
        available: new BigNumber(route.params.fromToken.amount),
        token: {
          displaySymbol: route.params.fromToken.displaySymbol,
          symbol: route.params.fromToken.symbol,
          name: route.params.fromToken.name
        }
      }, 'FROM')

      return
    }

    const pair = pairs.find((pair) => pair.data.id === route.params.pair?.id)
    if (pair === undefined) {
      return
    }
    if (tokenSelectOption.from.isPreselected) {
      onTokenSelect({
        tokenId: pair.data.tokenA.id,
        available: new BigNumber(pair.data.tokenA.reserve),
        token: {
          displaySymbol: pair.data.tokenA.displaySymbol,
          symbol: pair.data.tokenA.symbol,
          name: '' // not available in API
        },
        reserve: pair.data.tokenA.reserve
      }, 'FROM')
    }
    if (tokenSelectOption.to.isPreselected) {
      onTokenSelect({
        tokenId: pair.data.tokenB.id,
        available: new BigNumber(pair.data.tokenB.reserve),
        token: {
          displaySymbol: pair.data.tokenB.displaySymbol,
          symbol: pair.data.tokenB.symbol,
          name: '' // not available in API
        },
        reserve: pair.data.tokenB.reserve
      }, 'TO')
    }
  }, [route.params.pair, route.params.tokenSelectOption, route.params.fromToken])

  useEffect(() => {
    void getSelectedPoolPairs()
  }, [selectedTokenA, selectedTokenB])

  const getSelectedPoolPairs = async (): Promise<void> => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined) {
      const poolPairs = await getArbitraryPoolPair(selectedTokenA.id, selectedTokenB.id)
      setSelectedPoolPairs(poolPairs)
    }
  }

  useEffect(() => {
    void getPriceRates()
  }, [selectedPoolPairs, tokenA])

  const getPriceRates = async (): Promise<void> => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined && selectedPoolPairs !== undefined && tokenA !== undefined) {
      const {
        aToBPrice,
        bToAPrice,
        estimated
      } = await calculatePriceRates(selectedTokenA.id, selectedTokenB.id, new BigNumber(tokenA))
      // Find the selected reserve in case it's null. From Token Detail Screen, reserve does not exist due to pair not existing
      const selectedReserve = selectedPoolPairs[0]?.tokenA?.id === selectedTokenA.id ? selectedPoolPairs[0]?.tokenA?.reserve : selectedPoolPairs[0]?.tokenB?.reserve
      // This will keep the old behavior to prevent regression
      const tokenAReserve = new BigNumber(selectedTokenA.reserve).gt(0) ? selectedTokenA.reserve : selectedReserve
      const slippage = new BigNumber(1).minus(new BigNumber(tokenA).div(tokenAReserve))

      const estimatedAmountAfterSlippage = estimated.times(slippage).toFixed(8)
      setPriceRates([{
        label: translate('components/PricesSection', '1 {{token}} =', {
          token: selectedTokenA.displaySymbol
        }),
        value: bToAPrice.toFixed(8),
        symbolUSDValue: amountInUSDValue(selectedTokenA, tokenAAmount),
        usdTextStyle: tailwind('text-sm'),
        aSymbol: selectedTokenA.displaySymbol,
        bSymbol: selectedTokenB.displaySymbol
      }, {
        label: translate('components/PricesSection', '1 {{token}} =', {
          token: selectedTokenB.displaySymbol
        }),
        value: aToBPrice.toFixed(8),
        symbolUSDValue: amountInUSDValue(selectedTokenB, tokenBAmount),
        usdTextStyle: tailwind('text-sm'),
        aSymbol: selectedTokenB.displaySymbol,
        bSymbol: selectedTokenA.displaySymbol
      }
      ])

      setValue('tokenB', estimatedAmountAfterSlippage)
      // trigger validation for tokenB
      await trigger('tokenB')
    }
  }

  useEffect(() => {
    setIsFutureSwap(activeButtonGroup === ButtonGroupTabKey.FutureSwap && isFutureSwapOptionEnabled)
  }, [activeButtonGroup, isFutureSwapOptionEnabled])

  const navigateToConfirmScreen = (): void => {
    if (selectedPoolPairs === undefined || selectedTokenA === undefined || selectedTokenB === undefined || priceRates === undefined || tokenA === undefined || tokenB === undefined) {
      return
    }

    const ownedTokenB = tokens.find(token => token.id === selectedTokenB.id)
    const slippageInDecimal = new BigNumber(slippage).div(100)
    navigation.navigate('ConfirmCompositeSwapScreen', {
      fee,
      pairs: selectedPoolPairs,
      priceRates,
      slippage: slippageInDecimal,
      futureSwap: isFutureSwap
        ? {
          executionBlock,
          transactionDate,
          isSourceLoanToken: isSourceLoanToken,
          oraclePriceText
        }
        : undefined,
      swap: {
        tokenTo: selectedTokenB,
        tokenFrom: selectedTokenA,
        amountFrom: new BigNumber(tokenA),
        amountTo: new BigNumber(tokenB)
      },
      tokenA: selectedTokenA,
      tokenB: ownedTokenB !== undefined
        ? {
          ...selectedTokenB,
          amount: ownedTokenB.amount
        }
        : selectedTokenB,
      ...(isConversionRequired && {
        conversion: {
          isConversionRequired,
          DFIToken,
          DFIUtxo,
          conversionAmount
        }
      }),
      estimatedAmount: new BigNumber(tokenB)
    })
  }

  const onWarningBeforeSubmit = async (): Promise<void> => {
    if (selectedTokenB === undefined) {
      return
    }

    const message = dexStabilizationType === 'composite-dusd-with-fee'
      ? 'Are you certain you want to proceed with this swap despite the DEX Stabilization fees of {{fee}} that will be incurred as part of the composite path (DUSD -> {{tokenB}})?'
      : 'Are you certain you want to proceed to swap DUSD for {{tokenB}} despite the DEX Stabilization fees of {{fee}}?'

    WalletAlert({
      title: translate('screens/CompositeSwapScreen', ''),
      message: translate('screens/CompositeSwapScreen', message, {
        fee: `${dexStabilizationFee ?? 0}%`,
        tokenB: dexStabilizationType === 'composite-dusd-with-fee' ? dexStabilizationPair?.tokenBDisplaySymbol : selectedTokenB.displaySymbol
      }),
      buttons: [
        {
          text: translate('screens/Settings', 'Cancel'),
          style: 'cancel'
        },
        {
          text: translate('screens/Settings', 'Confirm'),
          onPress: async () => {
            await onSubmit()
          },
          style: 'default'
        }
      ]
    })
  }

  const onSubmit = async (): Promise<void> => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    if (isConversionRequired) {
      queueConvertTransaction({
        mode: 'utxosToAccount',
        amount: conversionAmount
      }, dispatch, () => {
        navigateToConfirmScreen()
      }, logger)
    } else {
      navigateToConfirmScreen()
    }
  }

  const onTokenSwitch = async (): Promise<void> => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined) {
      const tokenBId = selectedTokenB.id === '0' ? '0_unified' : selectedTokenB.id
      const ownedTokenB = tokens.find(token => token.id === tokenBId)
      setSelectedTokenA({
        ...selectedTokenB,
        id: tokenBId,
        amount: ownedTokenB !== undefined ? ownedTokenB.amount : '0'
      })
      setSelectedTokenB(selectedTokenA)
      setValue('tokenA', '')
      await trigger('tokenA')
      setValue('tokenB', '')
      await trigger('tokenB')
    }
  }

  const amountInUSDValue = useCallback((token: OwnedTokenState | TokenState | undefined, tokenAmount: any) => {
    // TODO: proper typechecking
    if (token === undefined || (tokenAmount === '') || isNaN(tokenAmount)) {
      return new BigNumber(0)
    }

    return getTokenPrice(token.symbol, new BigNumber(tokenAmount))
  }, [])

  const buildSummary = useCallback((amount: string): void => {
    setValue('tokenA', amount)
  }, [])

  function onPercentagePress (amount: string, type: AmountButtonTypes): void {
    buildSummary(amount)
    showToast(type)
  }

  function showToast (type: AmountButtonTypes): void {
    toast.hideAll()
    const isMax = type === AmountButtonTypes.Max
    const toastMessage = isMax ? 'Max available LP tokens entered' : '{{percent}} of available {{token}} entered'
      const toastOption = {
        token: selectedTokenA?.displaySymbol,
        percent: type
      }
    toast.show(translate('screens/CompositeSwapScreen', toastMessage, toastOption), {
      type: 'wallet_toast',
      placement: 'top',
      duration: TOAST_DURATION
    })
  }

  // TODO: Logic not done or correct i just put to imagine how it going to look
  const isReservedUtxoUsed = getDisplayUtxoWarningStatus(new BigNumber(tokenAAmount), selectedTokenA?.displaySymbol ?? '')

  const bottomSheetHeader = {
    headerStatusBarHeight: 2,
    headerTitle: '',
    headerBackTitleVisible: false,
    headerStyle: tailwind('rounded-t-xl-v2 border-b-0', {
      'bg-mono-light-v2-100': isLight,
      'bg-mono-dark-v2-100': !isLight
    }),
    headerRight: (): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          style={tailwind('mr-5 mt-4 -mb-4')}
          onPress={dismissModal}
          testID='close_bottom_sheet_button'
        >
          <ThemedIcon iconType='Feather' name='x-circle' size={22} />
        </ThemedTouchableOpacityV2>
      )
    },
    headerLeft: () => <></>
  }

  const viewSlippageInfo = useMemo(() => {
    return [
      {
        stackScreenName: 'ViewSlippageInfo',
        component: ViewSlippageToleranceInfo(),
        option: bottomSheetHeader
      }
    ]
  }, [isLight])

  // const viewSettlementsInfo = useMemo(() => {
  //   return [
  //     {
  //       stackScreenName: 'ViewSettlementsInfo',
  //       component: ViewSettlementsInfo(),
  //       option: bottomSheetHeader
  //     }
  //   ]
  // }, [isLight])

  // const viewFeeBreakdownInfo = useMemo(() => {
  //   return [
  //     {
  //       stackScreenName: 'ViewFeeBreakdownInfo',
  //       component: ViewFeeBreakdownInfo(),
  //       option: bottomSheetHeader
  //     }
  //   ]
  // }, [isLight])

  // enum ModalType {
  //   SLIPPAGE_MODAL,
  //   FEE_BREAKDOWN_MODAL,
  //   SETTLEMENTS_MODAL
  // }
  // const [modalType, setModalType] = useState<ModalType>()

  // function expandModalType (type: ModalType): void {
  //   expandModal()
  //   setModalType(type)
  // }

  return (
    <View style={tailwind('h-full')} ref={containerRef}>
      <ScreenTabButton
        activeButtonGroup={activeButtonGroup}
        onPress={(type) => onButtonGroupChange(type)}
      />
      <ThemedScrollViewV2 contentContainerStyle={tailwind('px-5')}>
        <View style={tailwind('my-8')}>
          <View>
            <ThemedTextV2
              style={tailwind('px-5 text-xs font-normal-v2')}
              light={tailwind('text-mono-light-v2-500')}
              dark={tailwind('text-mono-dark-v2-500')}
            >
              {translate('screens/CompositeSwapScreen', 'I HAVE {{totalAmount}} {{token}}', {
                totalAmount: selectedTokenA != null ? getMaxAmount(selectedTokenA) : '',
                token: selectedTokenA != null ? selectedTokenA.displaySymbol : ''
              })}
            </ThemedTextV2>
            <View style={tailwind('mb-6')}>
              <View style={tailwind('flex flex-row justify-between items-center pl-5 mt-4')}>
                <View style={tailwind('w-6/12 mr-2')}>
                  <Controller
                    control={control}
                    defaultValue=''
                    name='tokenA'
                    render={({
                  field: {
                    onChange,
                    value
                  }
                }) => (
                  <ThemedTextInputV2
                    style={tailwind('text-xl font-semibold-v2 w-full')}
                    light={tailwind('text-mono-light-v2-900')}
                    dark={tailwind('text-mono-dark-v2-900')}
                    keyboardType='numeric'
                    value={value}
                    onChange={onChange}
                    onChangeText={async (amount) => {
                      amount = isNaN(+amount) ? '0' : amount
                      setValue('tokenA', amount)
                      await trigger('tokenA')
                    }}
                    placeholder='0.00'
                    placeholderTextColor={getColor(isLight ? 'mono-light-v2-900' : 'mono-dark-v2-900')}
                  />
                )}
                    rules={{
                  required: true,
                  pattern: /^\d*\.?\d*$/,
                  max: BigNumber.max(selectedTokenA?.amount, 0).toFixed(8),
                  validate: {
                    greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
                  }
                }}
                  />
                  <ActiveUSDValueV2
                    price={amountInUSDValue(selectedTokenA ?? undefined, tokenAAmount)}
                    testId='amount_input_in_usd'
                    containerStyle={tailwind('w-full break-words')}
                  />
                </View>

                <TokenDropdownButton
                  symbol={selectedTokenA?.displaySymbol}
                  onPress={() => onBottomSheetSelect({ direction: 'FROM' })}
                />
              </View>
              {selectedTokenA != null &&
                <WantInfoText
                  tokenAAmount={tokenAAmount}
                  isReservedUtxoUsed={isReservedUtxoUsed}
                  selectedTokenA={selectedTokenA}
                />}
            </View>

            <TransactionCard
              maxValue={(selectedTokenA != null) ? new BigNumber(getMaxAmount(selectedTokenA)) : new BigNumber(0)}
              onChange={(amount, type) => onPercentagePress(amount, type)}
              amountButtonsStyle={tailwind('py-3')}
              containerStyle={tailwind('pl-5 pr-5 mr-px rounded-t-lg-v2')}
              disabled={selectedTokenA === undefined}
            />
          </View>

          {/* <View style={tailwind('flex-row justify-center -top-5')}>
            <ThemedTouchableOpacityV2
              onPress={onTokenSwitch}
              style={tailwind('p-2.5 rounded-full z-50')}
              light={tailwind('bg-mono-light-v2-900')}
              dark={tailwind('bg-mono-dark-v2-900')}
              testID='switch_button'
            >
              <ThemedIcon
                name='swap-vert'
                size={24}
                iconType='MaterialIcons'
                dark={tailwind('text-mono-dark-v2-00')}
                light={tailwind('text-mono-light-v2-00')}
              />
            </ThemedTouchableOpacityV2>
          </View> */}

          <View style={tailwind('my-8 relative items-center')}>
            <ThemedTouchableOpacityV2
              onPress={onTokenSwitch}
              style={tailwind('p-2.5 rounded-full z-50 border-0')}
              dark={tailwind('bg-mono-dark-v2-900')}
              light={tailwind('bg-mono-light-v2-900')}
              testID='switch_button'
            >
              <ThemedIcon
                name='swap-vert'
                size={24}
                iconType='MaterialIcons'
                dark={tailwind('text-mono-dark-v2-00')}
                light={tailwind('text-mono-light-v2-00')}
              />
            </ThemedTouchableOpacityV2>
            <ThemedViewV2
              dark={tailwind('border-mono-dark-v2-300')}
              light={tailwind('border-mono-light-v2-300')}
              style={tailwind('border-t-0.5 w-full bottom-1/2')}
            />
          </View>

          <ThemedViewV2
            style={tailwind('border-0', { 'border-b-0.5 pb-8': activeButtonGroup === ButtonGroupTabKey.InstantSwap })}
            dark={tailwind('border-mono-dark-v2-300')}
            light={tailwind('border-mono-light-v2-300')}
          >
            <ThemedTextV2
              style={tailwind('px-5 text-xs font-normal-v2')}
              light={tailwind('text-mono-light-v2-500')}
              dark={tailwind('text-mono-dark-v2-500')}
            >
              {translate('screens/CompositeSwapScreen', 'I WANT {{token}}', {
                token: selectedTokenB != null ? selectedTokenB.displaySymbol : ''
              })}
            </ThemedTextV2>
            <View style={tailwind('flex flex-row justify-between items-center pl-5 mt-4')}>
              <WantSwapRow
                activeTab={activeButtonGroup}
                tokenAmount={new BigNumber(tokenBAmount).toFixed(8)}
                tokenUsdAmount={amountInUSDValue(selectedTokenB ?? undefined, tokenBAmount)}
              />

              <TokenDropdownButton
                symbol={selectedTokenB?.displaySymbol}
                onPress={() => onBottomSheetSelect({ direction: 'TO' })}
                // disabled={isToTokenSelectDisabled || toTokens === undefined || toTokens?.length === 0}
              />

            </View>
          </ThemedViewV2>
        </View>

        <ThemedViewV2>
          {(selectedTokenB !== undefined && selectedTokenA !== undefined && priceRates !== undefined && tokenA !== undefined && tokenA !== '' && tokenB !== undefined) &&
            <>
              {activeButtonGroup === ButtonGroupTabKey.InstantSwap &&
                <SlippageToleranceCard
                  onSubmitSlippage={setSlippage}
                  slippage={slippage}
                  setSlippageError={setSlippageError}
                  expandModal={expandModal}
                />}
              <ThemedViewV2
                light={tailwind('border-mono-light-v2-300')}
                dark={tailwind('border-mono-dark-v2-300')}
                style={tailwind('mt-8 py-5 px-5 border rounded-lg-v2')}
              >
                <SwapSummary
                  instantSwapPriceRate={priceRates}
                  fee={fee}
                  activeTab={activeButtonGroup}
                  executionBlock={executionBlock}
                  transactionDate={transactionDate}
                  // onFeeBreakdownPress={}
                />
              </ThemedViewV2>
            </>}

          <View style={tailwind('mt-12 mx-7')}>
            <ButtonV2
              fillType='fill'
              label={translate('components/CompositeSwapScreen', 'Continue')}
              styleProps='w-full'
              disabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob || (slippageError?.type === 'error' && slippageError !== undefined) || (isFutureSwap && isEnded)}
              onPress={(dexStabilizationType === 'none' && isDexStabilizationEnabled) || !isDexStabilizationEnabled ? onSubmit : onWarningBeforeSubmit}
              testID='button_continue_remove_liq'
            />
          </View>
          {/* {activeButtonGroup === ButtonGroupTabKey.FutureSwap && (selectedTokenB !== undefined && selectedTokenA !== undefined && priceRates !== undefined && tokenA !== undefined && tokenA !== '' && tokenB !== undefined) &&
            <>
              <ThemedViewV2
                light={tailwind('border-mono-light-v2-300')}
                dark={tailwind('border-mono-dark-v2-300')}
                style={tailwind('py-5 px-5 border rounded-lg-v2')}
              >
                <SwapSummary priceRatesOption={priceRates} fee={fee} />
              </ThemedViewV2>
            </>} */}

          {/* {activeButtonGroup === ButtonGroupTabKey.InstantSwap && selectedTokenB !== undefined && selectedTokenA !== undefined &&
            <SlippageTolerance
              setSlippage={setSlippage}
              slippageError={slippageError}
              setSlippageError={setSlippageError}
              slippage={slippage}
            />} */}

          {/* {(selectedTokenB !== undefined && selectedTokenA !== undefined && priceRates !== undefined && tokenA !== undefined && tokenA !== '' && tokenB !== undefined) &&
            <>
              {!isFutureSwap &&
                <ThemedView
                  style={tailwind('rounded-t-lg mx-4 py-2')}
                  dark={tailwind('bg-gray-800 border-b border-gray-700')}
                  light={tailwind('bg-white border-b border-gray-200')}
                >
                  <PricesSection
                    testID='pricerate_value'
                    priceRates={priceRates}
                    isCompact
                  />
                </ThemedView>}
              <TransactionDetailsSection
                isFutureSwap={isFutureSwap}
                conversionAmount={conversionAmount}
                estimatedAmount={tokenB}
                fee={fee}
                isConversionRequired={isConversionRequired}
                tokenA={selectedTokenA}
                tokenB={selectedTokenB}
                executionBlock={executionBlock}
                timeRemaining={timeRemaining}
                transactionDate={transactionDate}
                oraclePriceText={oraclePriceText}
                isDexStabilizationEnabled={isDexStabilizationEnabled}
                dexStabilizationType={dexStabilizationType}
                dexStabilizationFee={dexStabilizationFee}
              />
            </>}
          {selectedTokenA !== undefined && selectedTokenB !== undefined && (
            <View style={tailwind('mb-2')}>
              <SubmitButtonGroup
                isDisabled={!formState.isValid ||
                hasPendingJob ||
                hasPendingBroadcastJob ||
                (slippageError?.type === 'error' && slippageError !== undefined) ||
                (isFutureSwap && isEnded)}
                label={translate('screens/CompositeSwapScreen', 'CONTINUE')}
                processingLabel={translate('screens/CompositeSwapScreen', 'CONTINUE')}
                onSubmit={(dexStabilizationType === 'none' && isDexStabilizationEnabled) || !isDexStabilizationEnabled ? onSubmit : onWarningBeforeSubmit}
                title='submit'
                isProcessing={hasPendingJob || hasPendingBroadcastJob}
                displayCancelBtn={false}
              />
            </View>
        )} */}
        </ThemedViewV2>

        {Platform.OS === 'web' && (
          <>
            <BottomSheetWebWithNav
              modalRef={containerRef}
              screenList={bottomSheetScreen}
              isModalDisplayed={isTokenModalDisplayed}
            />
            <BottomSheetWebWithNavV2
              modalRef={containerRef}
              screenList={viewSlippageInfo}
              isModalDisplayed={isModalDisplayed}
              // eslint-disable-next-line react-native/no-inline-styles
              modalStyle={{
                position: 'absolute',
                bottom: '0',
                height: '404px',
                width: '375px',
                zIndex: 50,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                overflow: 'hidden'
              }}
            />
          </>
        )}

        {Platform.OS !== 'web' && (
          <>
            <BottomSheetWithNav
              modalRef={bottomSheetRefV1}
              screenList={bottomSheetScreen}
              snapPoints={{
              ios: ['40%'],
              android: ['45%']
            }}
            />
            <BottomSheetWithNavV2
              modalRef={bottomSheetRef}
              screenList={viewSlippageInfo}
              snapPoints={modalSortingSnapPoints}
            />
          </>
        )}
      </ThemedScrollViewV2>
    </View>
  )
}

// function TransactionDetailsSection ({
//   isFutureSwap,
//   conversionAmount,
//   estimatedAmount,
//   fee,
//   isConversionRequired,
//   tokenA,
//   tokenB,
//   executionBlock,
//   timeRemaining,
//   transactionDate,
//   oraclePriceText,
//   isDexStabilizationEnabled,
//   dexStabilizationType,
//   dexStabilizationFee
// }: {
//   isFutureSwap: boolean
//   conversionAmount: BigNumber
//   estimatedAmount: string
//   fee: BigNumber
//   isConversionRequired: boolean
//   tokenA: OwnedTokenState
//   tokenB: TokenState
//   executionBlock: number
//   timeRemaining: string
//   transactionDate: string
//   oraclePriceText: string
//   isDexStabilizationEnabled: boolean
//   dexStabilizationType: DexStabilizationType
//   dexStabilizationFee?: string
// }): JSX.Element {
//   const { getBlocksCountdownUrl } = useDeFiScanContext()
//   const { getTokenPrice } = useTokenPrice()
//   const rowStyle = {
//     lhsThemedProps: {
//       light: tailwind('text-gray-500'),
//       dark: tailwind('text-gray-400')
//     },
//     rhsThemedProps: {
//       light: tailwind('text-gray-900'),
//       dark: tailwind('text-gray-50')
//     }
//   }

//   return (
//     <View style={tailwind('mx-4 overflow-hidden', {
//       'rounded-b-lg': !isFutureSwap,
//       'rounded-lg': isFutureSwap
//     })}
//     >
//       {isConversionRequired &&
//         <NumberRow
//           lhs={translate('screens/CompositeSwapScreen', 'UTXO to be converted')}
//           rhs={{
//             testID: 'amount_to_convert',
//             value: conversionAmount.toFixed(8),
//             suffixType: 'text',
//             suffix: tokenA.displaySymbol
//           }}
//           lhsThemedProps={rowStyle.lhsThemedProps}
//           rhsThemedProps={rowStyle.rhsThemedProps}
//         />}

//       {!isFutureSwap
//         ? (
//           <NumberRow
//             lhs={translate('screens/CompositeSwapScreen', 'Estimated to receive')}
//             rhs={{
//               value: estimatedAmount,
//               suffixType: 'text',
//               suffix: tokenB.displaySymbol,
//               testID: 'estimated_to_receive'
//             }}
//             textStyle={tailwind('text-sm font-normal')}
//             rhsUsdAmount={getTokenPrice(tokenB.symbol, new BigNumber(estimatedAmount), false)}
//             lhsThemedProps={rowStyle.lhsThemedProps}
//             rhsThemedProps={rowStyle.rhsThemedProps}
//           />
//         )
//         : (
//           <>
//             <TimeRemainingTextRow timeRemaining={timeRemaining} transactionDate={transactionDate} />
//             <InfoRow
//               type={InfoType.ExecutionBlock}
//               value={executionBlock}
//               testID='execution_block'
//               suffix={
//                 <TouchableOpacity
//                   onPress={async () => await openURL(getBlocksCountdownUrl(executionBlock))}
//                 >
//                   <ThemedIcon
//                     name='open-in-new'
//                     size={16}
//                     iconType='MaterialIcons'
//                     style={tailwind('ml-1')}
//                     light={tailwind('text-primary-500')}
//                     dark={tailwind('text-darkprimary-500')}
//                   />
//                 </TouchableOpacity>
//               }
//               lhsThemedProps={rowStyle.lhsThemedProps}
//               rhsThemedProps={rowStyle.rhsThemedProps}
//             />
//             <TextRow
//               lhs={{
//                 value: translate('screens/ConfirmCompositeSwapScreen', 'Estimated to receive'),
//                 themedProps: rowStyle.lhsThemedProps,
//                 testID: 'estimated_to_receive'
//               }}
//               rhs={{
//                 value: translate('screens/CompositeSwapScreen', `Oracle price ${oraclePriceText}`),
//                 themedProps: rowStyle.rhsThemedProps,
//                 testID: 'estimated_to_receive'
//               }}
//               textStyle={tailwind('text-sm font-normal')}
//               containerStyle={{
//                 dark: tailwind('bg-gray-800 border-b border-gray-700'),
//                 light: tailwind('bg-white border-b border-gray-200'),
//                 style: tailwind('p-4 flex-row items-start w-full')
//               }}
//             />
//           </>
//         )}
//       <InfoRow
//         type={InfoType.EstimatedFee}
//         value={fee.toFixed(8)}
//         testID='text_fee'
//         suffix='DFI'
//         lhsThemedProps={rowStyle.lhsThemedProps}
//         rhsThemedProps={rowStyle.rhsThemedProps}
//       />
//       {
//         isDexStabilizationEnabled && dexStabilizationType !== 'none' && dexStabilizationFee !== undefined && (
//           <NumberRow
//             lhs={translate('screens/CompositeSwapScreen', 'DEX stabilization fee')}
//             rhs={{
//               value: dexStabilizationFee,
//               suffix: '%',
//               testID: 'dex_stab_fee',
//               suffixType: 'text'
//             }}
//             textStyle={tailwind('text-sm font-normal')}
//             lhsThemedProps={rowStyle.lhsThemedProps}
//             rhsThemedProps={rowStyle.rhsThemedProps}
//           />
//         )
//       }
//     </View>
//   )
// }

// function TimeRemainingTextRow ({
//   timeRemaining,
//   transactionDate
// }: { timeRemaining: string, transactionDate: string }): JSX.Element {
//   return (
//     <ThemedView
//       dark={tailwind('bg-gray-800 border-b border-gray-700')}
//       light={tailwind('bg-white border-b border-gray-200')}
//       style={tailwind('p-4 flex-row items-start w-full')}
//     >
//       <View style={tailwind('w-6/12')}>
//         <View style={tailwind('flex-row items-end justify-start')}>
//           <ThemedText
//             style={tailwind('text-sm')}
//             light={tailwind('text-gray-500')}
//             dark={tailwind('text-gray-400')}
//             testID='time_remaining_label'
//           >
//             {translate('screens/CompositeSwapScreen', 'Est. time remaining')}
//           </ThemedText>
//         </View>
//       </View>
//       <View style={tailwind('flex flex-col justify-end flex-1')}>
//         <ThemedText
//           style={tailwind('text-sm text-right')}
//           light={tailwind('text-gray-900')}
//           dark={tailwind('text-gray-50')}
//           testID='time_remaining'
//         >
//           {`≈${timeRemaining}`}
//         </ThemedText>
//         <ThemedText
//           style={tailwind('text-xs text-right')}
//           light={tailwind('text-gray-500')}
//           dark={tailwind('text-gray-400')}
//         >
//           {`(${transactionDate})`}
//         </ThemedText>
//       </View>
//     </ThemedView>
//   )
// }
