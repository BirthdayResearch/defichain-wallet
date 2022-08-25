import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Control, Controller, useForm } from 'react-hook-form'
import BigNumber from 'bignumber.js'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
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
  ThemedScrollView,
  ThemedText,
  ThemedTouchableOpacity, ThemedView
} from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetToken, BottomSheetTokenList, TokenType } from '@components/BottomSheetTokenList'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { InfoRow, InfoType } from '@components/InfoRow'
import { InputHelperText } from '@components/InputHelperText'
import { NumberRow } from '@components/NumberRow'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { WalletTextInput } from '@components/WalletTextInput'
import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { SlippageError, SlippageTolerance } from './components/SlippageTolerance'
import { DexParamList } from '../DexNavigator'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useTokenBestPath } from '../../Portfolio/hooks/TokenBestPath'
import { useSlippageTolerance } from '../hook/SlippageTolerance'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useSwappableTokens } from '../hook/SwappableTokens'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { ButtonGroup } from '../components/ButtonGroup'
import { useFutureSwap, useFutureSwapDate } from '../hook/FutureSwap'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'
import NumberFormat from 'react-number-format'
import { TextRow } from '@components/TextRow'
import { PriceRateProps, PricesSection } from '@components/PricesSection'
import { fetchExecutionBlock } from '@store/futureSwap'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { WalletAlert } from '@components/WalletAlert'
import { AnnouncementBanner } from '../../Portfolio/components/Announcements'
import { DexStabilizationType, useDexStabilization } from '../hook/DexStabilization'
import { useFeatureFlagContext } from '@contexts/FeatureFlagContext'

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

export function CompositeSwapScreen ({ route }: Props): JSX.Element {
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

  const blockCount = useSelector((state: RootState) => state.block.count ?? 0)
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))

  const reservedDfi = 0.1
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
      label: translate('screens/CompositeSwapScreen', 'Instant Swap'),
      handleOnPress: () => onButtonGroupChange(ButtonGroupTabKey.InstantSwap)
    },
    {
      id: ButtonGroupTabKey.FutureSwap,
      label: translate('screens/CompositeSwapScreen', 'Future Swap'),
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

  return (
    <View style={tailwind('h-full')} ref={containerRef}>
      <ThemedScrollView>
        {
          (fromTokens !== undefined && fromTokens?.length > 0) && (
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('text-xl font-semibold m-4 mb-0')}
            >
              {translate('screens/CompositeSwapScreen', 'Swap tokens')}
            </ThemedText>
          )
        }

        <View style={tailwind(['flex flex-row mt-3 mx-2', { hidden: fromTokens?.length === 0 }])}>
          <TokenSelection
            label={translate('screens/CompositeSwapScreen', 'FROM')}
            symbol={selectedTokenA?.displaySymbol}
            onPress={() => onBottomSheetSelect({ direction: 'FROM' })}
            disabled={isFromTokenSelectDisabled || fromTokens === undefined || fromTokens?.length === 0}
          />
          <TokenSelection
            label={translate('screens/CompositeSwapScreen', 'TO')} symbol={selectedTokenB?.displaySymbol}
            onPress={() => onBottomSheetSelect({ direction: 'TO' })}
            disabled={isToTokenSelectDisabled || toTokens === undefined || toTokens?.length === 0}
          />
        </View>
        {isDexStabilizationEnabled && dexStabilizationType !== 'none' && dexStabilizationAnnouncement !== undefined &&
          <View style={tailwind('flex mx-4 mt-4 rounded')}>
            <AnnouncementBanner announcement={dexStabilizationAnnouncement} testID='swap_announcements_banner' />
          </View>}
        <ThemedView
          style={tailwind('m-4 pt-4 rounded-lg flex-1')}
          light={tailwind('bg-white')}
          dark={tailwind('bg-dfxblue-800')}
        >
          {isFutureSwapOptionEnabled &&
            <View style={tailwind('mb-4 mx-4')}>
              <ButtonGroup
                buttons={buttonGroup}
                activeButtonGroupItem={activeButtonGroup}
                labelStyle={tailwind('font-medium text-xs text-center py-0.5')}
                testID='swap_button_group'
                containerThemedProps={{
                  light: tailwind('bg-gray-100'),
                  dark: tailwind('bg-dfxblue-900')
                }}
                inverted
              />
            </View>}
          {(selectedTokenA === undefined || selectedTokenB === undefined) && fromTokens?.length !== 0 &&
            <ThemedText
              dark={tailwind('text-dfxgray-400')}
              light={tailwind('text-gray-500')}
              style={tailwind('text-center px-4 pb-4')}
              testID='swap_instructions'
            > {translate('screens/CompositeSwapScreen', 'Select tokens you want to swap to get started')}
            </ThemedText>}

          {selectedTokenA !== undefined && selectedTokenB !== undefined &&
            <View style={tailwind('mx-4 flex-1')}>
              <TokenRow
                control={control}
                title={translate('screens/CompositeSwapScreen', 'Enter amount to swap')}
                maxAmount={getMaxAmount(selectedTokenA)}
                onChangeFromAmount={async (amount) => {
                  amount = isNaN(+amount) ? '0' : amount
                  setValue('tokenA', amount)
                  await trigger('tokenA')
                }}
              />
              <InputHelperText
                testID='text_balance_amount'
                label={`${translate('screens/CompositeSwapScreen', 'Available:')} `}
                content={getMaxAmount(selectedTokenA)}
                suffix={` ${selectedTokenA.displaySymbol}`}
                labelStyleProps={tailwind('text-xs')}
                styleProps={tailwind('text-xs')}
              />
              {selectedTokenA.id === '0_unified' && (
                <View style={tailwind('mb-4')}>
                  <ReservedDFIInfoText />
                </View>
              )}
              <View style={tailwind(['flex flex-row items-center', { 'mb-4': isConversionRequired }])}>
                <TouchableOpacity
                  onPress={onTokenSwitch}
                  testID='switch_button'
                >
                  <ThemedIcon
                    name='swap-vert'
                    size={24}
                    iconType='MaterialIcons'
                    style={tailwind('w-8 mx-2')}
                    dark={tailwind('text-dfxred-500')}
                    light={tailwind('text-primary-500')}
                  />
                </TouchableOpacity>
                <View style={tailwind('flex-1')}>
                  {isFutureSwap
                    ? <OraclePriceRow
                        tokenDisplaySymbol={selectedTokenB.displaySymbol}
                        oraclePriceText={oraclePriceText}
                      />
                    : <TargetTokenRow control={control} token={selectedTokenB} />}
                </View>
              </View>
              {isConversionRequired && <ConversionInfoText />}
            </View>}
          {isFutureSwap && selectedTokenB !== undefined &&
            <ThemedView
              style={tailwind('flex flex-row py-2 px-4 mt-6 items-center rounded-t rounded-b-lg justify-between')}
              light={tailwind('bg-blue-100')}
              dark={tailwind('bg-darkblue-50')}
            >
              <ThemedText
                style={tailwind('text-xs')}
                light={tailwind('text-gray-500')}
                dark={tailwind('text-dfxgray-400')}
                testID='future_swap_warning_text'
              >
                {oraclePriceText === '+5%'
                  ? `${translate('screens/CompositeSwapScreen', 'By using future swap, you are buying {{tokenSymbol}} at 5% more than the oracle price at Settlement block', {
                    tokenSymbol: selectedTokenB.displaySymbol
                  })}`
                  : `${translate('screens/CompositeSwapScreen', 'By using future swap, you are selling {{tokenSymbol}} at 5% lower than the oracle price at Settlement block', {
                    tokenSymbol: selectedTokenA?.displaySymbol
                  })}`}
              </ThemedText>
            </ThemedView>}

          {activeButtonGroup === ButtonGroupTabKey.InstantSwap && selectedTokenB !== undefined && selectedTokenA !== undefined &&
            <SlippageTolerance
              setSlippage={setSlippage}
              slippageError={slippageError}
              setSlippageError={setSlippageError}
              slippage={slippage}
            />}
        </ThemedView>

        {(selectedTokenB !== undefined && selectedTokenA !== undefined && priceRates !== undefined && tokenA !== undefined && tokenA !== '' && tokenB !== undefined) &&
          <>
            {!isFutureSwap &&
              <ThemedView
                style={tailwind('rounded-t-lg mx-4 py-2')}
                dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
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
        )}

        {formState.isValid && selectedTokenA !== undefined && selectedTokenB !== undefined &&
          <ThemedText
            testID='transaction_details_hint_text'
            light={tailwind('text-gray-600')}
            dark={tailwind('text-dfxgray-300')}
            style={tailwind('pb-8 px-4 text-sm text-center')}
          >
            {isConversionRequired
              ? translate('screens/CompositeSwapScreen', 'Authorize transaction in the next screen to convert')
              : translate('screens/CompositeSwapScreen', 'Review and confirm transaction in the next screen')}
          </ThemedText>}

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
      </ThemedScrollView>
    </View>
  )
}

function TokenSelection (props: { symbol?: string, label: string, onPress: () => void, disabled: boolean }): JSX.Element {
  const Icon = getNativeIcon(props.symbol ?? '')
  return (
    <View style={[tailwind('flex-grow mx-2'), { flexBasis: 0 }]}>
      <ThemedText
        dark={tailwind('text-dfxgray-400')}
        light={tailwind('text-dfxgray-500')}
        style={tailwind('text-xs pb-1')}
      >{props.label}
      </ThemedText>
      <ThemedTouchableOpacity
        onPress={props.onPress}
        testID={`token_select_button_${props.label}`}
        dark={tailwind('bg-dfxblue-800 border-dfxblue-900')}
        light={tailwind({
          'bg-gray-200 border-0': props.disabled,
          'bg-white border-gray-300': !props.disabled
        })}
        style={tailwind('flex flex-row items-center border rounded p-2')}
        disabled={props.disabled}
      >
        {props.symbol === undefined &&
          <ThemedText
            dark={tailwind({
              'text-dfxgray-500': !props.disabled,
              'text-dfxblue-900': props.disabled
            })}
            light={tailwind('text-dfxgray-500')}
            style={tailwind('text-sm leading-6')}
          >
            {translate('screens/CompositeSwapScreen', 'Select token')}
          </ThemedText>}

        {props.symbol !== undefined &&
          <>
            <Icon testID='tokenA_icon' height={17} width={17} />
            <ThemedText
              style={tailwind('ml-2')}
              dark={tailwind({
                'text-gray-200': !props.disabled,
                'text-dfxgray-400': props.disabled
              })}
              light={tailwind({
                'text-gray-900': !props.disabled,
                'text-gray-500': props.disabled
              })}
            >{props.symbol}
            </ThemedText>
          </>}

        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={20}
          dark={tailwind({
            'text-dfxred-500': !props.disabled,
            'text-transparent': props.disabled
          })}
          light={tailwind({
            'text-primary-500': !props.disabled,
            'text-gray-500': props.disabled
          })}
          style={[tailwind('text-center mt-0.5'), { marginLeft: 'auto' }]}
        />
      </ThemedTouchableOpacity>
    </View>
  )
}

function TransactionDetailsSection ({
  isFutureSwap,
  conversionAmount,
  estimatedAmount,
  fee,
  isConversionRequired,
  tokenA,
  tokenB,
  executionBlock,
  timeRemaining,
  transactionDate,
  oraclePriceText,
  isDexStabilizationEnabled,
  dexStabilizationType,
  dexStabilizationFee
}: {
  isFutureSwap: boolean
  conversionAmount: BigNumber
  estimatedAmount: string
  fee: BigNumber
  isConversionRequired: boolean
  tokenA: OwnedTokenState
  tokenB: TokenState
  executionBlock: number
  timeRemaining: string
  transactionDate: string
  oraclePriceText: string
  isDexStabilizationEnabled: boolean
  dexStabilizationType: DexStabilizationType
  dexStabilizationFee?: string
}): JSX.Element {
  const { getBlocksCountdownUrl } = useDeFiScanContext()
  const { getTokenPrice } = useTokenPrice()
  const rowStyle = {
    lhsThemedProps: {
      light: tailwind('text-gray-500'),
      dark: tailwind('text-dfxgray-400')
    },
    rhsThemedProps: {
      light: tailwind('text-gray-900'),
      dark: tailwind('text-gray-50')
    }
  }

  return (
    <View style={tailwind('mx-4 overflow-hidden', {
      'rounded-b-lg': !isFutureSwap,
      'rounded-lg': isFutureSwap
    })}
    >
      {isConversionRequired &&
        <NumberRow
          lhs={translate('screens/CompositeSwapScreen', 'UTXO to be converted')}
          rhs={{
            testID: 'amount_to_convert',
            value: conversionAmount.toFixed(8),
            suffixType: 'text',
            suffix: tokenA.displaySymbol
          }}
          lhsThemedProps={rowStyle.lhsThemedProps}
          rhsThemedProps={rowStyle.rhsThemedProps}
        />}

      {!isFutureSwap
        ? (
          <NumberRow
            lhs={translate('screens/CompositeSwapScreen', 'Estimated to receive')}
            rhs={{
              value: estimatedAmount,
              suffixType: 'text',
              suffix: tokenB.displaySymbol,
              testID: 'estimated_to_receive'
            }}
            textStyle={tailwind('text-sm font-normal')}
            rhsUsdAmount={getTokenPrice(tokenB.symbol, new BigNumber(estimatedAmount), false)}
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
          />
        )
        : (
          <>
            <TimeRemainingTextRow timeRemaining={timeRemaining} transactionDate={transactionDate} />
            <InfoRow
              type={InfoType.ExecutionBlock}
              value={executionBlock}
              testID='execution_block'
              suffix={
                <TouchableOpacity
                  onPress={async () => await openURL(getBlocksCountdownUrl(executionBlock))}
                >
                  <ThemedIcon
                    name='open-in-new'
                    size={16}
                    iconType='MaterialIcons'
                    style={tailwind('ml-1')}
                    light={tailwind('text-primary-500')}
                    dark={tailwind('text-dfxred-500')}
                  />
                </TouchableOpacity>
              }
              lhsThemedProps={rowStyle.lhsThemedProps}
              rhsThemedProps={rowStyle.rhsThemedProps}
            />
            <TextRow
              lhs={{
                value: translate('screens/ConfirmCompositeSwapScreen', 'Estimated to receive'),
                themedProps: rowStyle.lhsThemedProps,
                testID: 'estimated_to_receive'
              }}
              rhs={{
                value: translate('screens/CompositeSwapScreen', `Oracle price ${oraclePriceText}`),
                themedProps: rowStyle.rhsThemedProps,
                testID: 'estimated_to_receive'
              }}
              textStyle={tailwind('text-sm font-normal')}
              containerStyle={{
                dark: tailwind('bg-dfxblue-800 border-b border-dfxblue-900'),
                light: tailwind('bg-white border-b border-gray-200'),
                style: tailwind('p-4 flex-row items-start w-full')
              }}
            />
          </>
        )}
      <InfoRow
        type={InfoType.EstimatedFee}
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
        lhsThemedProps={rowStyle.lhsThemedProps}
        rhsThemedProps={rowStyle.rhsThemedProps}
      />
      {
        isDexStabilizationEnabled && dexStabilizationType !== 'none' && dexStabilizationFee !== undefined && (
          <NumberRow
            lhs={translate('screens/CompositeSwapScreen', 'DEX stabilization fee')}
            rhs={{
              value: dexStabilizationFee,
              suffix: '%',
              testID: 'dex_stab_fee',
              suffixType: 'text'
            }}
            textStyle={tailwind('text-sm font-normal')}
            lhsThemedProps={rowStyle.lhsThemedProps}
            rhsThemedProps={rowStyle.rhsThemedProps}
          />
        )
      }
    </View>
  )
}

function TimeRemainingTextRow ({
  timeRemaining,
  transactionDate
}: { timeRemaining: string, transactionDate: string }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-dfxblue-800 border-b border-dfxblue-900')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-6/12')}>
        <View style={tailwind('flex-row items-end justify-start')}>
          <ThemedText
            style={tailwind('text-sm')}
            light={tailwind('text-gray-500')}
            dark={tailwind('text-dfxgray-400')}
            testID='time_remaining_label'
          >
            {translate('screens/CompositeSwapScreen', 'Est. time remaining')}
          </ThemedText>
        </View>
      </View>
      <View style={tailwind('flex flex-col justify-end flex-1')}>
        <ThemedText
          style={tailwind('text-sm text-right')}
          light={tailwind('text-gray-900')}
          dark={tailwind('text-gray-50')}
          testID='time_remaining'
        >
          {`≈${timeRemaining}`}
        </ThemedText>
        <ThemedText
          style={tailwind('text-xs text-right')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-dfxgray-400')}
        >
          {`(${transactionDate})`}
        </ThemedText>
      </View>
    </ThemedView>
  )
}

interface TokenForm {
  control: Control<{ tokenA: string, tokenB: string }>
  maxAmount?: string
  onChangeFromAmount: (amount: string) => void
  title: string
}

function TokenRow (form: TokenForm): JSX.Element {
  const {
    control,
    onChangeFromAmount,
    title,
    maxAmount
  } = form
  const rules: { required: boolean, pattern: RegExp, validate: any, max?: string } = {
    required: true,
    max: maxAmount,
    pattern: /^\d*\.?\d*$/,
    validate: {
      greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
    }
  }
  const defaultValue = ''

  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name='tokenA'
      render={({
        field: {
          value
        }
      }) => (
        <ThemedView
          dark={tailwind('bg-transparent')}
          light={tailwind('bg-transparent')}
          style={tailwind('flex-row')}
        >
          <WalletTextInput
            autoCapitalize='none'
            onChange={(e) => {
              onChangeFromAmount(e.nativeEvent.text)
            }}
            placeholder={translate('screens/CompositeSwapScreen', 'Enter an amount')}
            style={tailwind('flex-grow w-2/5')}
            testID='text_input_tokenA'
            value={value}
            displayClearButton={(value !== defaultValue)}
            onClearButtonPress={() => onChangeFromAmount(defaultValue)}
            title={title}
            inputType='numeric'
          >
            <>
              <SetAmountButton
                amount={new BigNumber(maxAmount ?? '0')}
                onPress={onChangeFromAmount}
                type={AmountButtonTypes.half}
              />

              <SetAmountButton
                amount={new BigNumber(maxAmount ?? '0')}
                onPress={onChangeFromAmount}
                type={AmountButtonTypes.max}
              />
            </>
          </WalletTextInput>
        </ThemedView>
      )}
      rules={rules}
    />
  )
}

interface OraclePriceRowProps {
  oraclePriceText: string
  tokenDisplaySymbol: string
}

function OraclePriceRow ({
  oraclePriceText,
  tokenDisplaySymbol
}: OraclePriceRowProps): JSX.Element {
  const Icon = getNativeIcon(tokenDisplaySymbol)

  return (
    <ThemedView
      light={tailwind('bg-gray-50')}
      dark={tailwind('border border-dfxblue-900')}
      style={tailwind('flex-row flex-grow justify-between items-center p-2 rounded')}
    >
      <ThemedText
        style={tailwind('self-center text-sm')}
        light={tailwind('text-gray-400')}
        dark={tailwind('text-dfxgray-500')}
        testID='oracle_price_percentage'
      >{translate('screens/CompositeSwapScreen', 'Oracle price {{percentageChange}}', {
        percentageChange: oraclePriceText
      })}
      </ThemedText>
      <View style={tailwind('flex flex-row items-center')}>
        <Icon height={20} width={20} />
        <ThemedText style={tailwind('pl-2')}>{tokenDisplaySymbol}</ThemedText>
      </View>
    </ThemedView>
  )
}

// Separated from TokenRow due to custom UI styling difficulties
interface TargetTokenForm {
  token: TokenState | OwnedTokenState
  control: Control<{ tokenA: string, tokenB: string }>
}

function TargetTokenRow (form: TargetTokenForm): JSX.Element {
  const {
    token,
    control
  } = form
  const Icon = getNativeIcon(token.displaySymbol)
  const rules: { required: boolean, pattern: RegExp, validate: any, max?: string } = {
    required: true,
    pattern: /^\d*\.?\d*$/,
    validate: {
      greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
    }
  }
  const defaultValue = ''

  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name='tokenB'
      render={({
        field: {
          value
        }
      }) => (
        <ThemedView
          light={tailwind('bg-gray-50')}
          style={tailwind('flex-row flex-grow justify-between items-center p-2 rounded')}
        >
          <NumberFormat
            value={value}
            thousandSeparator
            displayType='text'
            renderText={value =>
              <ThemedText
                style={tailwind('self-center text-sm')}
                light={tailwind('text-gray-500')}
                dark={tailwind('text-dfxgray-400')}
                testID='text_input_tokenB'
              >
                {value}
              </ThemedText>}
          />
          <View style={tailwind('flex flex-row items-center')}>
            <Icon height={20} width={20} />
            <ThemedText style={tailwind('pl-2')}>{token.displaySymbol}</ThemedText>
          </View>
        </ThemedView>
      )}
      rules={rules}
    />
  )
}
