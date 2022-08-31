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
import { PriceRateProps, PricesSection } from '@components/PricesSection'
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
import { useToast } from 'react-native-toast-notifications'
import NumberFormat from 'react-number-format'

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
type SwapToken = 'have' | 'want'

export function CompositeSwapScreenV2 ({ route }: Props): JSX.Element {
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

  const blockCount = useSelector((state: RootState) => state.block.count ?? 0)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))

  const reservedDfi = 0.1
  const TOAST_DURATION = 2000
  const [bottomSheetScreen, setBottomSheetScreen] = useState<BottomSheetNavScreen[]>([])
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [slippageError, setSlippageError] = useState<SlippageError | undefined>()
  const [selectedTokenA, setSelectedTokenA] = useState<OwnedTokenState>()
  const [selectedTokenB, setSelectedTokenB] = useState<TokenState>()
  const [selectedPoolPairs, setSelectedPoolPairs] = useState<PoolPairData[]>()
  const [priceRates, setPriceRates] = useState<PriceRateProps[]>()
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const [isFromTokenSelectDisabled, setIsFromTokenSelectDisabled] = useState(false)
  const [isToTokenSelectDisabled, setIsToTokenSelectDisabled] = useState(false)
  const buttonGroup = [
    {
      id: ButtonGroupTabKey.InstantSwap,
      label: translate('screens/CompositeSwapScreen', 'Instant'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.InstantSwap)
    },
    {
      id: ButtonGroupTabKey.FutureSwap,
      label: translate('screens/CompositeSwapScreen', 'Future'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.FutureSwap)
    }
  ]
  const [activeButtonGroup, setActiveButtonGroup] = useState<ButtonGroupTabKey>(ButtonGroupTabKey.InstantSwap)
  const [isFutureSwap, setIsFutureSwap] = useState(false)

  const executionBlock = useSelector((state: RootState) => state.futureSwaps.executionBlock)
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
  const containerRef = useRef(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)

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
          onCloseButtonPress: () => dismissModal(),
          onTokenPress: (item): void => {
            onTokenSelect(item, direction)
            dismissModal()
          }
        }),
        option: {
          header: () => null
        }
      }])
    expandModal()
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
        label: translate('components/PricesSection', '1 {{token}}', {
          token: selectedTokenB.displaySymbol
        }),
        value: bToAPrice.toFixed(8),
        aSymbol: selectedTokenB.displaySymbol,
        bSymbol: selectedTokenA.displaySymbol
      }, {
        label: translate('components/PricesSection', '1 {{token}}', {
          token: selectedTokenA.displaySymbol
        }),
        value: aToBPrice.toFixed(8),
        aSymbol: selectedTokenA.displaySymbol,
        bSymbol: selectedTokenB.displaySymbol
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

  const amountInUSDValue = useCallback((tokenAmount: string, token?: OwnedTokenState) => {
    if (token === undefined || (tokenAmount === '')) {
      return new BigNumber(0)
    }

    return getTokenPrice(token.symbol, new BigNumber(tokenAmount))
  }, [selectedTokenA, tokenAAmount])

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

  const [isCustomSlippage, setIsCustomSlippage] = useState(false)
  // const [slippageAmount, setSlippageAmount] = useState()

  function onSlippageChange (amount: string, type: SlippageAmountButtonTypes): void {
    if (type === SlippageAmountButtonTypes.Custom) {
      setIsCustomSlippage(true)
    }
  }

  console.log('tokenAAmount', tokenAAmount)
  console.log('tokenBAmount', tokenBAmount)

  // function slippageChange (value: string): void {
  //   console.log('value', value)
  //   setSlippageAmount(value)
  // }

  // const buildSlippage = (amount: string): string => {
  //   console.log('amount', amount)
  //   const maxValue = selectedTokenA != null ? new BigNumber(getMaxAmount(selectedTokenA)) : new BigNumber(0)
  //   // setSlippageAmount(maxValue.multipliedBy(amount).toFixed(8))
  // }

  return (
    <View style={tailwind('h-full')} ref={containerRef}>
      <ThemedViewV2
        light={tailwind('bg-mono-light-v2-00 border-mono-light-v2-100')}
        dark={tailwind('bg-mono-dark-v2-00 border-mono-dark-v2-100')}
        style={tailwind('flex flex-col items-center pt-4 rounded-b-2xl border-b')}
      >
        <View style={tailwind('w-full px-5')}>
          <ButtonGroupV2
            buttons={buttonGroup}
            activeButtonGroupItem={activeButtonGroup}
            testID='swap_tabs'
            lightThemeStyle={tailwind('bg-transparent')}
            darkThemeStyle={tailwind('bg-transparent')}
          />
        </View>
      </ThemedViewV2>
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
            <View style={tailwind('flex flex-row justify-between items-center pl-5 mb-6 mt-4')}>
              <View>
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
                  // price={amountInUSDValue(selectedTokenA ?? undefined, tokenAAmount)}
                  price={amountInUSDValue(selectedTokenA != null ? selectedTokenA : undefined, tokenAAmount)}
                  testId='amount_input_in_usd'
                  containerStyle={tailwind('w-full break-words')}
                />
              </View>

              <TokenDropdownButton
                symbol={selectedTokenA?.displaySymbol}
                onPress={() => onBottomSheetSelect({ direction: 'FROM' })}
                disabled={isFromTokenSelectDisabled || fromTokens === undefined || fromTokens?.length === 0}
              />

            </View>

            <TransactionCard
              maxValue={(selectedTokenA != null) ? new BigNumber(getMaxAmount(selectedTokenA)) : new BigNumber(0)}
              onChange={(amount, type) => onPercentagePress(amount, type)}
              amountButtonsStyle={tailwind('py-3')}
              containerStyle={tailwind('pl-5 pr-5 mr-px rounded-t-lg-v2')}
              disabled={selectedTokenA === undefined}
            />
          </View>

          <View style={tailwind('my-8 relative items-center')}>
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
            <ThemedViewV2
              dark={tailwind('border-mono-dark-v2-300')}
              light={tailwind('border-mono-light-v2-300')}
              style={tailwind('border-t-0.5 w-full bottom-1/2')}
            />
          </View>

          <View>
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
              <View style={tailwind('')}>
                <NumberFormat
                  decimalScale={8}
                  displayType='text'
                  renderText={(val: string) => (
                    <ThemedTextV2
                      style={tailwind('text-left font-normal-v2 text-xl')}
                      light={tailwind('text-mono-light-v2-700')}
                      dark={tailwind('text-mono-dark-v2-700')}
                    >
                      {val === '' ? '0.00' : val}
                    </ThemedTextV2>
                  )}
                  value={new BigNumber(tokenBAmount).toFixed(8)}
                />
                <ActiveUSDValueV2
                  price={selectedTokenB != null ? getTokenPrice(selectedTokenB.symbol, new BigNumber(tokenBAmount)) : new BigNumber(0)}
                  testId='amount_input_in_usd'
                  containerStyle={tailwind('w-full break-words')}
                />
              </View>

              <TokenDropdownButton
                symbol={selectedTokenB?.displaySymbol}
                onPress={() => onBottomSheetSelect({ direction: 'TO' })}
                disabled={isToTokenSelectDisabled || toTokens === undefined || toTokens?.length === 0}
              />

            </View>
          </View>
        </View>

        {/* {selectedTokenA !== undefined && selectedTokenB !== undefined &&
          <ThemedViewV2
            style={tailwind('border-t-0.5')}
            dark={tailwind('border-mono-dark-v2-300')}
            light={tailwind('border-mono-light-v2-300')}
          >
            <ThemedTextV2
              style={tailwind('mt-8 text-xs font-normal-v2 px-5 pb-2')}
              dark={tailwind('text-mono-dark-v2-500')}
              light={tailwind('text-mono-light-v2-500')}
            >
              {translate('screens/CompositeSwapScreen', 'SLIPPAGE TOLERANCE')}
            </ThemedTextV2>
            <SlippageToleranceCard
              maxValue={(selectedTokenA != null) ? new BigNumber(getMaxAmount(selectedTokenA)) : new BigNumber(0)}
              onChange={(amount, type) => onSlippageChange(amount, type)}
              isCustomSlippage={isCustomSlippage}
            >
              <View style={tailwind('flex flex-row')}>
                <WalletTextInputV2
                  onChangeText={slippageChange}
                  keyboardType='numeric'
                  autoCapitalize='none'
                  placeholder='0.00%'
                  style={tailwind('h-6 rounded-full')}
                  containerStyle='w-9/12 pr-2 rounded-full'
                  // inputContainerStyle={tailwind('rounded-full')}
                  testID='slippage_input'
                  value={slippageAmount !== undefined ? slippageAmount : ''}
                  displayClearButton={slippageAmount !== ''}
                  onClearButtonPress={() => {
                  setIsCustomSlippage(false)
                  slippageChange('')
                }}
                  inputType='numeric'
                />
                <ThemedTouchableOpacityV2
                  light={tailwind('bg-mono-light-v2-900')}
                  dark={tailwind('bg-mono-dark-v2-900')}
                  style={tailwind('p-2.5 flex justify-center items-center flex-grow rounded-full')}
                >
                  <ThemedTextV2
                    light={tailwind('text-mono-light-v2-100')}
                    dark={tailwind('text-mono-dark-v2-100')}
                    style={tailwind('text-xs font-semibold-v2')}
                  >
                    {translate('components/CompositeSwapScreen', 'Set')}
                  </ThemedTextV2>
                </ThemedTouchableOpacityV2>
              </View>
            </SlippageToleranceCard>
            {activeButtonGroup === ButtonGroupTabKey.InstantSwap && selectedTokenB !== undefined && selectedTokenA !== undefined &&
              <SlippageTolerance
                setSlippage={setSlippage}
                slippageError={slippageError}
                setSlippageError={setSlippageError}
                slippage={slippage}
              />}
          </ThemedViewV2>} */}

        {Platform.OS === 'web' && (
          <BottomSheetWebWithNav
            modalRef={containerRef}
            screenList={bottomSheetScreen}
            isModalDisplayed={isModalDisplayed}
          />
        )}

        {Platform.OS !== 'web' && (
          <BottomSheetWithNav
            modalRef={bottomSheetRef}
            screenList={bottomSheetScreen}
            snapPoints={{
              ios: ['40%'],
              android: ['45%']
            }}
          />
        )}
      </ThemedScrollViewV2>
    </View>
  )
}

// interface TokenForm {
//   control: Control<{ tokenA: string, tokenB: string }>
//   maxAmount?: string
//   onChangeFromAmount: (amount: string) => void
//   token: string
// }

// function TokenRow (form: TokenForm): JSX.Element {
//   const {
//     control,
//     onChangeFromAmount,
//     maxAmount,
//     token
//   } = form
//   const rules: { required: boolean, pattern: RegExp, validate: any, max?: string } = {
//     required: true,
//     max: maxAmount,
//     pattern: /^\d*\.?\d*$/,
//     validate: {
//       greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
//     }
//   }
//   const defaultValue = ''

//   return (
//     <Controller
//       control={control}
//       defaultValue={defaultValue}
//       name='tokenA'
//       render={({
//         field: {
//           onChange,
//           value
//         }
//       }) => (
//         // <ThemedView
//         //   dark={tailwind('bg-transparent')}
//         //   light={tailwind('bg-transparent')}
//         //   style={tailwind('flex-row')}
//         // >
//         //   <WalletTextInput
//         //     autoCapitalize='none'
//         //     onChange={(e) => {
//         //       onChangeFromAmount(e.nativeEvent.text)
//         //     }}
//         //     placeholder={translate('screens/CompositeSwapScreen', 'Enter an amount')}
//         //     style={tailwind('flex-grow w-2/5')}
//         //     testID='text_input_tokenA'
//         //     value={value}
//         //     displayClearButton={(value !== defaultValue)}
//         //     onClearButtonPress={() => onChangeFromAmount(defaultValue)}
//         //     inputType='numeric'
//         //   />
//         // </ThemedView>
//         <ThemedTextInputV2
//           style={tailwind('text-lg font-semibold-v2 w-full')}
//           light={tailwind('text-mono-light-v2-900')}
//           dark={tailwind('text-mono-dark-v2-900')}
//           keyboardType='numeric'
//           value={value}
//           onChange={onChange}
//           onChangeText={async (amount) => {
//           amount = isNaN(+amount) ? '0' : amount
//           setValue(token, amount)
//           await trigger(token)
//         }}
//           placeholder='0.00'
//           // placeholderTextColor={getColor(isLight ? 'mono-light-v2-900' : 'mono-dark-v2-900')}
//           testID='amount_input'
//           ref={amountInputRef}
//         />
//       )}
//       rules={rules}
//     />
//   )
// }
