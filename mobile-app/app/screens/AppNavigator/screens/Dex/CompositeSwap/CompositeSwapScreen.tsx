import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Control, Controller, useForm } from 'react-hook-form'
import BigNumber from 'bignumber.js'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { translate } from '@translations'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { DFITokenSelector, DFIUtxoSelector, fetchTokens, tokensSelector } from '@store/wallet'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
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
import { PriceRateProps } from './components/PricesSection'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { WalletTextInput } from '@components/WalletTextInput'
import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { SlippageError, SlippageTolerance } from './components/SlippageTolerance'
import { DexParamList } from '../DexNavigator'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useTokenPrice } from '../../Balances/hooks/TokenPrice'
import { useSlippageTolerance } from '../hook/SlippageTolerance'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'
import { useSwappableTokens } from '../hook/SwappableTokens'
import { ButtonGroup } from '../components/ButtonGroup'
import { useFutureSwap } from '../hook/FutureSwap'
import { useDeFiScanContext } from '@shared-contexts/DeFiScanContext'
import { openURL } from '@api/linking'

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
  const isFocused = useIsFocused()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const dispatch = useDispatch()
  const { address } = useWalletContext()
  const {
    calculatePriceRates,
    getArbitraryPoolPair
  } = useTokenPrice()
  const {
    slippage,
    setSlippage
  } = useSlippageTolerance()

  const blockCount = useSelector((state: RootState) => state.block.count)
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

  const { fromTokens, toTokens } = useSwappableTokens(selectedTokenA?.id)
  const { isFutureSwapOptionEnabled, oraclePriceText } = useFutureSwap({
    fromTokenDisplaySymbol: selectedTokenA?.displaySymbol,
    toTokenDisplaySymbol: selectedTokenB?.displaySymbol
  })
  const containerRef = useRef(null)
  const bottomSheetRef = useRef<BottomSheetModal>(null)

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

  console.log({ activeButtonGroup })

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
  const tokenAFormAmount = tokenA === '' ? undefined : tokenA
  const tokenBFormAmount = tokenB === '' ? undefined : tokenB
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
      dispatch(fetchTokens({
        client,
        address
      }))
    }
  }, [address, blockCount, isFocused])

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    if (route.params.pair?.id === undefined) {
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
  }, [route.params.pair, route.params.tokenSelectOption])

  useEffect(() => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined) {
      const poolPairs = getArbitraryPoolPair(selectedTokenA.symbol, selectedTokenB.symbol)
      setSelectedPoolPairs(poolPairs)
    }
  }, [selectedTokenA, selectedTokenB])

  useEffect(() => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined && selectedPoolPairs !== undefined && tokenAFormAmount !== undefined) {
      const {
        aToBPrice,
        bToAPrice,
        estimated
      } = calculatePriceRates(selectedTokenA.symbol, selectedPoolPairs, new BigNumber(tokenAFormAmount))
      const slippage = new BigNumber(1).minus(new BigNumber(tokenAFormAmount).div(selectedTokenA.reserve))

      const estimatedAmountAfterSlippage = estimated.times(slippage).toFixed(8)
      setPriceRates([{
        label: translate('screens/CompositeSwapScreen', '{{tokenA}} price in {{tokenB}}', {
          tokenA: selectedTokenA.displaySymbol,
          tokenB: selectedTokenB.displaySymbol
        }),
        value: aToBPrice.toFixed(8),
        aSymbol: selectedTokenA.displaySymbol,
        bSymbol: selectedTokenB.displaySymbol
      }, {
        label: translate('screens/CompositeSwapScreen', '{{tokenB}} price in {{tokenA}}', {
          tokenA: selectedTokenA.displaySymbol,
          tokenB: selectedTokenB.displaySymbol
        }),
        value: bToAPrice.toFixed(8),
        aSymbol: selectedTokenB.displaySymbol,
        bSymbol: selectedTokenA.displaySymbol
      }
      ])

      setValue('tokenB', estimatedAmountAfterSlippage)
    }
  }, [selectedPoolPairs, tokenAFormAmount])

  const navigateToConfirmScreen = (): void => {
    if (selectedPoolPairs === undefined || selectedTokenA === undefined || selectedTokenB === undefined || priceRates === undefined || tokenAFormAmount === undefined || tokenBFormAmount === undefined) {
      return
    }

    const ownedTokenB = tokens.find(token => token.id === selectedTokenB.id)
    const slippageInDecimal = new BigNumber(slippage).div(100)
    navigation.navigate('ConfirmCompositeSwapScreen', {
      fee,
      pairs: selectedPoolPairs,
      priceRates,
      slippage: slippageInDecimal,
      swap: {
        tokenTo: selectedTokenB,
        tokenFrom: selectedTokenA,
        amountFrom: new BigNumber(tokenAFormAmount),
        amountTo: new BigNumber(tokenBFormAmount)
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
      })
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
        <ThemedView
          style={tailwind('m-4 pt-4')}
          light={tailwind('bg-white')}
          dark={tailwind('bg-gray-800')}
        >
          {isFutureSwapOptionEnabled &&
            <View style={tailwind('mb-4 mx-4')}>
              <ButtonGroup
                buttons={buttonGroup}
                activeButtonGroupItem={activeButtonGroup} // TODO(pierregee): update to dynamic
                modalStyle={tailwind('font-medium text-xs text-center py-0.5')}
                testID='swap_button_group'
              />
            </View>}
          {(selectedTokenA === undefined || selectedTokenB === undefined) && fromTokens?.length !== 0 &&
            <ThemedText
              dark={tailwind('text-gray-400')}
              light={tailwind('text-gray-500')}
              style={tailwind('mt-10 text-center px-4')}
              testID='swap_instructions'
            > {translate('screens/CompositeSwapScreen', 'Select tokens you want to swap to get started')}
            </ThemedText>}

          {selectedTokenA !== undefined && selectedTokenB !== undefined &&
            <View style={tailwind('mx-4')}>
              <TokenRow
                control={control}
                controlName='tokenA'
                isDisabled={false}
                title={translate('screens/CompositeSwapScreen', 'Enter amount to swap')}
                maxAmount={getMaxAmount(selectedTokenA)}
                enableMaxButton
                onChangeFromAmount={async (amount) => {
                  amount = isNaN(+amount) ? '0' : amount
                  setValue('tokenA', amount)
                  await trigger('tokenA')
                }}
                token={selectedTokenA}
              />
              <InputHelperText
                testID='text_balance_amount'
                label={`${translate('screens/CompositeSwapScreen', 'You have')} `}
                content={getMaxAmount(selectedTokenA)}
                suffix={` ${selectedTokenA.displaySymbol}`}
              />
              {selectedTokenA.id === '0_unified' && <ReservedDFIInfoText />}
              <View style={tailwind(['flex flex-row items-center', { 'mb-4': isConversionRequired }])}>
                <TouchableOpacity
                  onPress={onTokenSwitch}
                  testID='switch_button'
                >
                  <ThemedIcon
                    name='swap-vert'
                    size={24}
                    iconType='MaterialIcons'
                    style={tailwind('w-8 mx-2 mt-2.5')}
                    dark={tailwind('text-darkprimary-500')}
                    light={tailwind('text-primary-500')}
                  />
                </TouchableOpacity>
                <View style={tailwind('flex-1')}>
                  <TokenRow
                    control={control}
                    controlName='tokenB'
                    isDisabled
                    token={selectedTokenB}
                    enableMaxButton={false}
                  />
                </View>
              </View>
              {isConversionRequired && <ConversionInfoText />}
            </View>}
          {isFutureSwapOptionEnabled && activeButtonGroup === ButtonGroupTabKey.FutureSwap && selectedTokenB !== undefined &&
            <ThemedView
              style={tailwind('flex flex-row p-2 mt-6 items-center rounded-t justify-between')}
              light={tailwind('bg-blue-100')}
              dark={tailwind('bg-darkblue-50')}
            >
              <ThemedText
                style={tailwind('text-xs')}
                light={tailwind('text-gray-500')}
                dark={tailwind('text-gray-400')}
              >
                {`${translate('screens/CompositeSwapScreen', 'By using future swap, you are ')} `}
                <ThemedText style={tailwind('text-xs font-medium')}>
                  {
                    translate('screens/CompositeSwapScreen',
                      oraclePriceText === '+5%'
                        ? 'buying {{toTokenSymbol}} at 5% more'
                        : 'selling {{toTokenSymbol}} at 5% lower',
                      { toTokenSymbol: selectedTokenB.displaySymbol })
                  }
                </ThemedText>
                {` ${translate('screens/CompositeSwapScreen', 'than the oracle price')}`}
              </ThemedText>
            </ThemedView>}
        </ThemedView>

        {(selectedTokenB !== undefined && selectedTokenA !== undefined && priceRates !== undefined && tokenAFormAmount !== undefined && tokenBFormAmount !== undefined) &&
          <>
            {activeButtonGroup === ButtonGroupTabKey.InstantSwap &&
              <SlippageTolerance
                setSlippage={setSlippage}
                slippageError={slippageError}
                setSlippageError={setSlippageError}
                slippage={slippage}
              />}
            <TransactionDetailsSection
              activeTab={activeButtonGroup}
              conversionAmount={conversionAmount}
              estimatedAmount={tokenBFormAmount}
              fee={fee}
              isConversionRequired={isConversionRequired}
              tokenA={selectedTokenA}
              tokenB={selectedTokenB}
              priceRate={priceRates[1]}
              executionBlock={123456789}
            />
          </>}
        {selectedTokenA !== undefined && selectedTokenB !== undefined && (
          <View style={tailwind('mb-2')}>
            <SubmitButtonGroup
              isDisabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob || (slippageError?.type === 'error' && slippageError !== undefined)}
              label={translate('screens/CompositeSwapScreen', 'CONTINUE')}
              processingLabel={translate('screens/CompositeSwapScreen', 'CONTINUE')}
              onSubmit={onSubmit}
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
            dark={tailwind('text-gray-300')}
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
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs pb-1')}
      >{props.label}
      </ThemedText>
      <ThemedTouchableOpacity
        onPress={props.onPress}
        testID={`token_select_button_${props.label}`}
        dark={tailwind({
          'bg-gray-600 text-gray-500 border-0': props.disabled,
          'bg-gray-800 border-gray-400': !props.disabled
        })}
        light={tailwind({
          'bg-gray-200 border-0': props.disabled,
          'bg-white border-gray-300': !props.disabled
        })}
        style={tailwind('flex flex-row items-center border rounded p-2')}
        disabled={props.disabled}
      >
        {props.symbol === undefined &&
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
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
                'text-gray-400': props.disabled
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
            'text-darkprimary-500': !props.disabled,
            'text-gray-400': props.disabled
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
  activeTab,
  conversionAmount,
  estimatedAmount,
  fee,
  isConversionRequired,
  tokenA,
  tokenB,
  priceRate,
  executionBlock
}: {
  activeTab: ButtonGroupTabKey
  conversionAmount: BigNumber
  estimatedAmount: string
  fee: BigNumber
  isConversionRequired: boolean
  tokenA: OwnedTokenState
  tokenB: TokenState
  priceRate: PriceRateProps
  executionBlock: number
}): JSX.Element {
  const { getBlocksCountdownUrl } = useDeFiScanContext()
  return (
    <View style={tailwind('rounded-lg mx-4 overflow-hidden')}>
      {isConversionRequired &&
        <NumberRow
          lhs={translate('screens/CompositeSwapScreen', 'UTXO to be converted')}
          rhs={{
            testID: 'amount_to_convert',
            value: conversionAmount.toFixed(8),
            suffixType: 'text',
            suffix: tokenA.displaySymbol
          }}
        />}

      {activeTab === ButtonGroupTabKey.InstantSwap
        ? (
          <NumberRow
            lhs={translate('screens/CompositeSwapScreen', `Price (${tokenB.displaySymbol}/${tokenA.displaySymbol})`)}
            rhs={{
              value: new BigNumber(priceRate.value).toFixed(8),
              suffixType: 'text',
              suffix: tokenB.displaySymbol,
              testID: 'price_rate_B_per_A'
            }}
            textStyle={tailwind('text-sm font-normal')}
          />
        )
        : (
          <>
            <TimeRemainingTextRow timeRemaining='6d 12h 36m' />
            <InfoRow
              type={InfoType.ExecutionBlock}
              value={executionBlock}
              testID='text_fee'
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
                    dark={tailwind('text-darkprimary-500')}
                  />
                </TouchableOpacity>
              }
            />
          </>
        )}

      <NumberRow
        lhs={translate('screens/CompositeSwapScreen', 'Estimated to receive')}
        rhs={{
          value: estimatedAmount,
          suffixType: 'text',
          suffix: tokenB.displaySymbol,
          testID: 'estimated_to_receive'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <InfoRow
        type={InfoType.EstimatedFee}
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
    </View>
  )
}

function TimeRemainingTextRow ({ timeRemaining }: { timeRemaining: string }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={tailwind('p-4 flex-row items-start w-full')}
    >
      <View style={tailwind('w-6/12')}>
        <View style={tailwind('flex-row items-end justify-start')}>
          <ThemedText
            style={tailwind('text-sm')}
            testID='time_remaining_label'
          >
            {translate('screens/CompositeSwapScreen', 'Est. time remaining')}
          </ThemedText>
        </View>
      </View>
      <View style={tailwind('flex flex-col justify-end flex-1')}>
        <ThemedText
          style={tailwind('text-sm text-right')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          {`≈ ${timeRemaining}`}
        </ThemedText>
        <ThemedText
          style={tailwind('text-xs text-right')}
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
        >
          (04/13/2022)
        </ThemedText>
      </View>
    </ThemedView>
  )
}

interface TokenForm {
  control: Control<{ tokenA: string, tokenB: string }>
  controlName: 'tokenA' | 'tokenB'
  token: TokenState | OwnedTokenState
  enableMaxButton: boolean
  maxAmount?: string
  onChangeFromAmount?: (amount: string) => void
  title?: string
  isDisabled: boolean
}

function TokenRow (form: TokenForm): JSX.Element {
  const {
    token,
    control,
    onChangeFromAmount,
    title,
    controlName,
    enableMaxButton,
    isDisabled,
    maxAmount
  } = form
  const Icon = getNativeIcon(token.displaySymbol)
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
      name={controlName}
      render={({
        field: {
          onChange,
          value
        }
      }) => (
        <ThemedView
          dark={tailwind('bg-transparent')}
          light={tailwind('bg-transparent')}
          style={tailwind('flex-row flex-grow')}
        >
          <WalletTextInput
            autoCapitalize='none'
            editable={!isDisabled}
            onChange={(e) => {
              if (!isDisabled) {
                if (onChangeFromAmount !== undefined) {
                  onChangeFromAmount(e.nativeEvent.text)
                } else {
                  onChange(e)
                }
              }
            }}
            placeholder={isDisabled ? undefined : translate('screens/CompositeSwapScreen', 'Enter an amount')}
            style={tailwind('flex-grow w-2/5')}
            testID={`text_input_${controlName}`}
            value={value}
            displayClearButton={(value !== defaultValue) && !isDisabled}
            onClearButtonPress={() => onChangeFromAmount?.(defaultValue)}
            title={title}
            inputType='numeric'
          >
            {
              (enableMaxButton && onChangeFromAmount !== undefined) && (
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
              )
            }
            {
              !enableMaxButton && (
                <>
                  <Icon height={20} width={20} />
                  <ThemedText style={tailwind('pl-2')}>
                    {token.displaySymbol}
                  </ThemedText>
                </>
              )
            }
          </WalletTextInput>
        </ThemedView>
      )}
      rules={rules}
    />
  )
}
