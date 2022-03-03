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
import { DexItem, DFITokenSelector, DFIUtxoSelector, fetchTokens, tokensSelector } from '@store/wallet'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { StackScreenProps } from '@react-navigation/stack'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity, ThemedView
} from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { BottomSheetNavScreen, BottomSheetWebWithNav, BottomSheetWithNav } from '@components/BottomSheetWithNav'
import { BottomSheetToken, BottomSheetTokenList, TokenType } from '@components/BottomSheetTokenList'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { InputHelperText } from '@components/InputHelperText'
import { NumberRow } from '@components/NumberRow'
import { PriceRateProps, PricesSection } from './components/PricesSection'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { WalletTextInput } from '@components/WalletTextInput'
import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { getAdjacentNodes, GraphProps } from '../helpers/path-finding'
import { SlippageError, SlippageTolerance } from './components/SlippageTolerance'
import { DexParamList } from '../DexNavigator'
import { useWalletContext } from '@shared-contexts/WalletContext'
import { useTokenPrice } from '../../Balances/hooks/TokenPrice'
import { useSlippageTolerance } from '../hook/SlippageTolerance'
import { SubmitButtonGroup } from '@components/SubmitButtonGroup'

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
  const [allowedSwapFromTokens, setAllowedSwapFromTokens] = useState<BottomSheetToken[]>()
  const [allowedSwapToTokens, setAllowedSwapToTokens] = useState<BottomSheetToken[]>()
  const [allTokens, setAllTokens] = useState<TokenState[]>()
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const [isTokenSelectDisabled, setIsTokenSelectDisabled] = useState(false)
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
          tokens: direction === 'FROM' ? allowedSwapFromTokens ?? [] : allowedSwapToTokens ?? [],
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

    setIsTokenSelectDisabled(true)

    const pair = pairs.find((pair) => pair.data.id === route.params.pair?.id)
    if (pair !== undefined) {
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
  }, [route.params.pair])

  useEffect(() => {
    if (pairs === undefined) {
      return
    }

    const tokens = pairs.reduce((tokensInPair: TokenState[], pair: DexItem): TokenState[] => {
      const hasTokenA = tokensInPair.some(token => pair.data.tokenA.id === token.id)
      const hasTokenB = tokensInPair.some(token => pair.data.tokenB.id === token.id)
      const tokensToAdd: TokenState[] = []
      if (!hasTokenA) {
        tokensToAdd.push(pair.data.tokenA)
      }
      if (!hasTokenB) {
        tokensToAdd.push(pair.data.tokenB)
      }

      return [...tokensInPair, ...tokensToAdd]
    }, [])

    setAllTokens(tokens)
  }, [pairs])

  useEffect(() => {
    if (allTokens === undefined) {
      return
    }

    const swappableFromTokens: BottomSheetToken[] = allTokens
      .map((token) => {
        const tokenId = token.id === '0' ? '0_unified' : token.id
        const ownedToken = tokens.find(t => t.id === tokenId)
        return {
          tokenId: tokenId,
          available: new BigNumber(ownedToken === undefined ? 0 : ownedToken.amount),
          token: {
            displaySymbol: token.displaySymbol,
            name: '', // not available in API,
            symbol: token.symbol
          },
          reserve: token.reserve
        }
      }).sort((a, b) => b.available.minus(a.available).toNumber())

    setAllowedSwapFromTokens(swappableFromTokens)

    if (selectedTokenA !== undefined && allTokens !== undefined) {
      setAllowedSwapToTokens(getAllPossibleSwapToTokens(allTokens, pairs, selectedTokenA.id === '0_unified' ? '0' : selectedTokenA.id))
    }
  }, [tokens, selectedTokenA, selectedTokenB])

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
          (allowedSwapFromTokens !== undefined && allowedSwapFromTokens?.length > 0) && (
            <ThemedText
              dark={tailwind('text-gray-50')}
              light={tailwind('text-gray-900')}
              style={tailwind('text-xl font-semibold m-4 mb-0')}
            >
              {translate('screens/CompositeSwapScreen', 'Swap tokens')}
            </ThemedText>
          )
        }

        <View style={tailwind(['flex flex-row mt-3 mx-2', { hidden: allowedSwapFromTokens?.length === 0 }])}>
          <TokenSelection
            label={translate('screens/CompositeSwapScreen', 'FROM')}
            symbol={selectedTokenA?.displaySymbol}
            onPress={() => onBottomSheetSelect({ direction: 'FROM' })}
            disabled={isTokenSelectDisabled || allowedSwapFromTokens === undefined || allowedSwapFromTokens?.length === 0}
          />
          <TokenSelection
            label={translate('screens/CompositeSwapScreen', 'TO')} symbol={selectedTokenB?.displaySymbol}
            onPress={() => onBottomSheetSelect({ direction: 'TO' })}
            disabled={isTokenSelectDisabled || allowedSwapToTokens === undefined || allowedSwapToTokens?.length === 0}
          />
        </View>

        {(selectedTokenA === undefined || selectedTokenB === undefined) && allowedSwapFromTokens?.length !== 0 &&
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={tailwind('mt-10 text-center px-4')}
            testID='swap_instructions'
          > {translate('screens/CompositeSwapScreen', 'Select tokens you want to swap to get started')}
          </ThemedText>}

        {selectedTokenA !== undefined && selectedTokenB !== undefined &&
          <View style={tailwind('mt-10 mx-4')}>
            <TokenRow
              control={control}
              controlName='tokenA'
              isDisabled={false}
              title={translate('screens/CompositeSwapScreen', 'How much {{token}} do you want to swap?', { token: selectedTokenA.displaySymbol })}
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

        {(selectedTokenB !== undefined && selectedTokenA !== undefined && priceRates !== undefined && tokenAFormAmount !== undefined && tokenBFormAmount !== undefined) &&
          <>
            <SlippageTolerance
              setSlippage={setSlippage}
              slippageError={slippageError}
              setSlippageError={setSlippageError}
              slippage={slippage}
            />
            <PricesSection priceRates={priceRates} sectionTitle='PRICES' />
            <TransactionDetailsSection
              amountToSwap={tokenAFormAmount}
              conversionAmount={conversionAmount}
              estimatedAmount={tokenBFormAmount}
              fee={fee}
              isConversionRequired={isConversionRequired}
              tokenA={selectedTokenA}
              tokenB={selectedTokenB}
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
  amountToSwap,
  conversionAmount,
  estimatedAmount,
  fee,
  isConversionRequired,
  tokenA,
  tokenB
}: {
  amountToSwap: string
  conversionAmount: BigNumber
  estimatedAmount: string
  fee: BigNumber
  isConversionRequired: boolean
  tokenA: OwnedTokenState
  tokenB: TokenState
}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        testID='title_add_detail'
        text={translate('screens/CompositeSwapScreen', 'TRANSACTION DETAILS')}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
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
      <NumberRow
        lhs={translate('screens/CompositeSwapScreen', 'Total to be swapped')}
        rhs={{
          value: new BigNumber(amountToSwap).toFixed(8),
          suffixType: 'text',
          suffix: tokenA.displaySymbol,
          testID: 'total_to_be_swapped'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
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
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
    </>
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

/**
 * This function finds all the possible adjacent vertices of an undirected graph in the context of tokens and pairs
 * @param tokens
 * @param pairs
 * @param tokenFrom
 */
function getAllPossibleSwapToTokens (allTokens: TokenState[], pairs: DexItem[], tokenFrom: string): BottomSheetToken[] {
  const graph: GraphProps[] = pairs.map(pair => {
    const graphItem: GraphProps = {
      pairId: pair.data.id,
      a: pair.data.tokenA.id,
      b: pair.data.tokenB.id
    }
    return graphItem
  })

  const reachableNodes: string[] = []
  const reachableNodeIds = new Set<string>([])
  // Use Sets to reduce checks if item is unique
  const visitedNodes = new Set<string>([])
  const nodesToVisit = new Set<string>([tokenFrom])

  while (nodesToVisit.size !== 0) {
    const [token] = nodesToVisit // first item in a set
    const adjacentNodes = getAdjacentNodes(token, graph)
    if (adjacentNodes.length !== 0) {
      adjacentNodes.forEach(node => {
        if (!reachableNodeIds.has(node)) {
          reachableNodes.push(node)
        }

        // If the token hasn't been visited, flag for visit.
        if (!visitedNodes.has(node)) {
          nodesToVisit.add(node)
        }
        reachableNodeIds.add(node)
      })
    }

    visitedNodes.add(token)
    nodesToVisit.delete(token)
  }

  return reachableNodes.reduce((tokens: BottomSheetToken[], node: string): BottomSheetToken[] => {
    const token = allTokens.find(token => token.id === node)
    if (token !== undefined && node !== tokenFrom) {
      return [
        ...tokens, {
          tokenId: token.id,
          available: new BigNumber(token.reserve),
          token: {
            name: '', // Not available in API
            displaySymbol: token.displaySymbol,
            symbol: token.symbol
          },
          reserve: token.reserve
        }
      ]
    }
    return tokens
  }, [])
}
