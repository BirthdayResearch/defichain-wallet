import { InputHelperTextV2 } from '@components/InputHelperText'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Platform } from 'react-native'
import { ThemedIcon, ThemedScrollViewV2, ThemedTextV2, ThemedTouchableOpacityV2, ThemedViewV2 } from '@components/themed'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { DFITokenSelector, DFIUtxoSelector, tokensSelector, WalletToken } from '@store/wallet'
import { useSelector } from 'react-redux'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { queueConvertTransaction, useConversion } from '@hooks/wallet/Conversion'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useAppDispatch } from '@hooks/useAppDispatch'
import { AmountButtonTypes, TransactionCard, TransactionCardStatus } from '@components/TransactionCard'
import { getNativeIcon } from '@components/icons/assets'
import { WalletTransactionCardTextInput } from '@components/WalletTransactionCardTextInput'
import { PricesSectionV2 } from '@components/PricesSectionV2'
import { useTokenPrice } from '../Portfolio/hooks/TokenPrice'
import { NumberRowV2 } from '@components/NumberRowV2'
import { BottomSheetWebWithNavV2, BottomSheetWithNavV2 } from '@components/BottomSheetWithNavV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ViewPoolHeader } from './components/ViewPoolHeader'
import { ViewPoolDetails, DataRoutes } from './components/ViewPoolDetails'
import { ReservedDFIInfoTextV2 } from '@components/ReservedDFIInfoText'
import { ButtonV2 } from '@components/ButtonV2'
import { useToast } from 'react-native-toast-notifications'
import { useDisplayUtxoWarning } from './hook/useDisplayUtxoWarning'
import { useBottomSheet } from '@hooks/useBottomSheet'

type Props = StackScreenProps<DexParamList, 'AddLiquidity'>
type EditingAmount = 'primary' | 'secondary'

interface ExtPoolPairData extends PoolPairData {
  aSymbol: string
  bSymbol: string
  aToBRate: BigNumber
  bToARate: BigNumber
}

export function AddLiquidityScreenV2 (props: Props): JSX.Element {
  const logger = useLogger()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const dispatch = useAppDispatch()
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const pairs = useSelector((state: RootState) => state.wallet.poolpairs)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const { getTokenPrice } = useTokenPrice()
  const { pair: pairData, pairInfo } = props.route.params

  // breakdown summary state
  const [hasAInputAmount, setHasAInputAmount] = useState(false)
  const [hasBInputAmount, setHasBInputAmount] = useState(false)

  // transaction card component
  const [tokenATransactionCardStatus, setTokenATransactionCardStatus] = useState<TransactionCardStatus>()
  const [tokenBTransactionCardStatus, setTokenBTransactionCardStatus] = useState<TransactionCardStatus>()
  const [hasAError, setHasAError] = useState(false)
  const [hasBError, setHasBError] = useState(false)
  const [isInputAFocus, setIsInputAFocus] = useState(false)
  const [isInputBFocus, setIsInputBFocus] = useState(false)

  const { isLight } = useThemeContext()
  const modalSortingSnapPoints = { ios: ['50%'], android: ['50%'] }

  const { getDisplayUtxoWarningStatus } = useDisplayUtxoWarning()
  const [showUTXOFeesAMsg, setShowUTXOFeesAMsg] = useState<boolean>(false)
  const [showUTXOFeesBMsg, setShowUTXOFeesBMsg] = useState<boolean>(false)

  // this component UI state
  const [tokenAAmount, setTokenAAmount] = useState<string>('')
  const [tokenBAmount, setTokenBAmount] = useState<string>('')
  const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))
  const [canContinue, setCanContinue] = useState(false)

  // derived from props
  const [balanceA, setBalanceA] = useState(new BigNumber(0))
  const [balanceB, setBalanceB] = useState(new BigNumber(0))
  const [pair, setPair] = useState<ExtPoolPairData>()
  const {
    isConversionRequired,
    conversionAmount
  } = useConversion({
    inputToken: {
      type: 'token',
      amount: new BigNumber(pair?.tokenA.id === '0' ? tokenAAmount : tokenBAmount)
    },
    deps: [pair, tokenAAmount, tokenBAmount, balanceA, balanceB]
  })

  const toast = useToast()
  const TOAST_DURATION = 2000
  const {
    bottomSheetRef,
    containerRef,
    expandModal,
    dismissModal,
    isModalDisplayed
  } = useBottomSheet()

  const BottomSheetHeader = {
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

  const buildSummary = useCallback((ref: EditingAmount, amountString: string): void => {
    const refAmount = amountString.length === 0 || isNaN(+amountString) ? new BigNumber(0) : new BigNumber(amountString)
    if (pair === undefined) {
      return
    }
    if (ref === 'primary') {
      setTokenAAmount(amountString)
      setTokenBAmount(refAmount.times(pair.aToBRate).toFixed(8))
      setSharePercentage(refAmount.div(pair.tokenA.reserve))
    } else {
      setTokenBAmount(amountString)
      setTokenAAmount(refAmount.times(pair.bToARate).toFixed(8))
      setSharePercentage(refAmount.div(pair.tokenB.reserve))
    }
  }, [pair])

  const getAddressTokenById = (poolpairTokenId: string): WalletToken | undefined => {
    return tokens.find(token => {
      if (poolpairTokenId === '0' || poolpairTokenId === '0_utxo') {
        return token.id === '0_unified'
      }
      return token.id === poolpairTokenId
    })
  }

  const ViewPoolContents = useMemo(() => {
    return [
      {
        stackScreenName: 'ViewPoolShare',
        component: ViewPoolDetails({
          dataRoutes: DataRoutes.AddLiquidity,
          pairData: pairData,
          pairInfo: pairInfo
        }),
        option: BottomSheetHeader
      }
    ]
  }, [isLight])

  function onPercentagePress (_amount: string, type: AmountButtonTypes, displaySymbolA: string, displaySymbolB: string): void {
    showToast(type, displaySymbolA, displaySymbolB)
  }

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }

    if (!canContinue || pair === undefined) {
      return
    }

    if (isConversionRequired) {
      queueConvertTransaction({
        mode: 'utxosToAccount',
        amount: conversionAmount
      }, dispatch, () => {
        // onbroadcast starts = called
        navigation.navigate({
          name: 'ConfirmAddLiquidity',
          params: {
            summary: {
              fee: new BigNumber(0.0001),
              tokenAAmount: new BigNumber(tokenAAmount),
              tokenBAmount: new BigNumber(tokenBAmount),
              percentage: sharePercentage,
              tokenABalance: balanceA,
              tokenBBalance: balanceB,
              lmTotalTokens: lmTotalTokens
            },
            pair,
            conversion: {
              isConversionRequired,
              DFIToken,
              DFIUtxo,
              conversionAmount
            },
            pairInfo
          },
          merge: true
        })
      }, logger, () => {
        navigation.navigate({
          name: 'ConfirmAddLiquidity',
          params: {
            summary: {
              fee: new BigNumber(0.0001),
              tokenAAmount: new BigNumber(tokenAAmount),
              tokenBAmount: new BigNumber(tokenBAmount),
              percentage: sharePercentage,
              tokenABalance: balanceA,
              tokenBBalance: balanceB,
              lmTotalTokens: lmTotalTokens
            },
            pair,
            conversion: {
              isConversionRequired,
              DFIToken,
              DFIUtxo,
              conversionAmount,
              isConverted: true // to pass loading component for tokens conversion in confirm screen
            },
            pairInfo
          },
          merge: true
        })
      })
    } else {
      navigation.navigate({
        name: 'ConfirmAddLiquidity',
        params: {
          summary: {
            fee: new BigNumber(0.0001),
            tokenAAmount: new BigNumber(tokenAAmount),
            tokenBAmount: new BigNumber(tokenBAmount),
            percentage: sharePercentage,
            tokenABalance: balanceA,
            tokenBBalance: balanceB,
            lmTotalTokens: lmTotalTokens
          },
          pair,
          pairInfo
        },
        merge: true
      })
    }
  }

  function showToast (type: AmountButtonTypes, displaySymbolA: string, displaySymbolB: string): void {
    if (displaySymbolA === undefined || displaySymbolB === undefined) {
      return
    }

    toast.hideAll() // hides old toast everytime user clicks on a new percentage
    const isMax = type === AmountButtonTypes.Max
    const toastMessage = isMax ? 'Max available {{unit}} entered' : '{{percent}} of available {{unit}} entered'
    const toastOption = {
      unit: `${displaySymbolA}-${displaySymbolB}`,
      percent: type
    }
    toast.show(translate('screens/AddLiquidity', toastMessage, toastOption), {
      type: 'wallet_toast',
      placement: 'top',
      duration: TOAST_DURATION
    })
  }

  // handle breadkown summary state
  useEffect(() => {
    if (new BigNumber(tokenAAmount).isGreaterThan(0)) {
      setHasAInputAmount(true)
    } else {
      setHasAInputAmount(false)
    }
  }, [tokenAAmount])

  useEffect(() => {
    if (new BigNumber(tokenBAmount).isGreaterThan(0)) {
      setHasBInputAmount(true)
    } else {
      setHasBInputAmount(false)
    }
  }, [tokenBAmount])

  // display UTXO fees msg only for DFI tokens in input card
  useEffect(() => {
    if (pair !== undefined && getDisplayUtxoWarningStatus(new BigNumber(tokenAAmount), pair?.tokenA.displaySymbol) && new BigNumber(tokenAAmount).isGreaterThan(0)) {
      return setShowUTXOFeesAMsg(true)
    } else {
      return setShowUTXOFeesAMsg(false)
    }
  }, [tokenAAmount])

  useEffect(() => {
    if (pair !== undefined && getDisplayUtxoWarningStatus(new BigNumber(tokenBAmount), pair?.tokenB.displaySymbol) && new BigNumber(tokenBAmount).isGreaterThan(0)) {
      return setShowUTXOFeesBMsg(true)
    } else {
      return setShowUTXOFeesBMsg(false)
    }
  }, [tokenBAmount])

  // display err msg for insufficient balance
  useEffect(() => {
    if (new BigNumber(tokenAAmount).isGreaterThan(balanceA)) {
      setHasAError(true)
    } else {
      setHasAError(false)
    }
  }, [tokenAAmount, balanceA])

  useEffect(() => {
    if (new BigNumber(tokenBAmount).isGreaterThan(balanceB)) {
      setHasBError(true)
    } else {
      setHasBError(false)
    }
  }, [tokenBAmount, balanceB])

  // set focus on current transaction card
  useEffect(() => {
    setTokenATransactionCardStatus(hasAError ? TransactionCardStatus.Error : isInputAFocus ? TransactionCardStatus.Active : undefined)
    setTokenBTransactionCardStatus(hasBError ? TransactionCardStatus.Error : isInputBFocus ? TransactionCardStatus.Active : undefined)
  }, [hasAError, hasBError, isInputAFocus, isInputBFocus])

  useEffect(() => {
    if (pair === undefined) {
      return
    }
    setCanContinue(canAddLiquidity(
      pair,
      new BigNumber(tokenAAmount),
      new BigNumber(tokenBAmount),
      balanceA,
      balanceB
    ))
  }, [pair, tokenAAmount, tokenBAmount, balanceA, balanceB])

  // prop/global state change
  useEffect(() => {
    const { pair: poolPairData } = props.route.params
    const poolpair = pairs.find((p) => p.data.id === poolPairData.id)?.data
    const reservedDfi = 0.1
    if (poolpair !== undefined) {
      const [aSymbol, bSymbol] = poolpair.symbol.split('-')
      const addressTokenA = getAddressTokenById(poolpair.tokenA.id)
      const addressTokenB = getAddressTokenById(poolpair.tokenB.id)

      // side effect to state
      setPair({
        ...poolpair,
        aSymbol,
        bSymbol,
        aToBRate: new BigNumber(poolpair.tokenB.reserve).div(poolpair.tokenA.reserve),
        bToARate: new BigNumber(poolpair.tokenA.reserve).div(poolpair.tokenB.reserve)
      })
      if (addressTokenA !== undefined) {
        setBalanceA(addressTokenA.id === '0_unified' ? new BigNumber(addressTokenA.amount).minus(reservedDfi) : new BigNumber(addressTokenA.amount))
      }
      if (addressTokenB !== undefined) {
        setBalanceB(addressTokenB.id === '0_unified' ? new BigNumber(addressTokenB.amount).minus(reservedDfi) : new BigNumber(addressTokenB.amount))
      }
    }
  }, [props.route.params.pair, JSON.stringify(tokens), pairs])

  if (pair === undefined) {
    return <></>
  }

  const lmTotalTokens = sharePercentage.times(pair.totalLiquidity.token).toFixed(8)

  return (
    <View ref={containerRef} style={tailwind('flex-col flex-1')}>
      <ThemedScrollViewV2 ref={containerRef} contentContainerStyle={tailwind('flex-grow py-8 mx-5 justify-between')} style={tailwind('w-full')}>
        <View>
          <ViewPoolHeader
            tokenASymbol={pair.tokenA.displaySymbol}
            tokenBSymbol={pair.tokenB.displaySymbol}
            headerLabel={translate('screens/AddLiquidity', 'View pool info')}
            onPress={expandModal}
            testID='view_pool_shares'
          />
          <View style={tailwind('mt-8')}>
            <AddLiquidityInputCard
              balance={balanceA}
              current={tokenAAmount}
              onChange={(amount) =>
                buildSummary('primary', amount)}
              onPercentageChange={(amount, type) => {
                onPercentagePress(amount, type, pair.tokenA.displaySymbol, pair.tokenB.displaySymbol)
              }}
              symbol={pair.tokenA.displaySymbol}
              type='primary'
              setIsInputFocus={setIsInputAFocus}
              status={tokenATransactionCardStatus}
              showInsufficientTokenMsg={hasAError}
              showUTXOFeesMsg={showUTXOFeesAMsg}
              hasInputAmount={hasAInputAmount}
            />
            <AddLiquidityInputCard
              balance={balanceB}
              current={tokenBAmount}
              onChange={(amount) => {
                buildSummary('secondary', amount)
              }}
              onPercentageChange={(amount, type) => {
                buildSummary('secondary', amount)
                onPercentagePress(amount, type, pair.tokenA.displaySymbol, pair.tokenB.displaySymbol)
              }}
              symbol={pair.tokenB.displaySymbol}
              type='secondary'
              setIsInputFocus={setIsInputBFocus}
              status={tokenBTransactionCardStatus}
              showInsufficientTokenMsg={hasBError}
              showUTXOFeesMsg={showUTXOFeesBMsg}
              hasInputAmount={hasBInputAmount}
            />
          </View>

          {hasAInputAmount && hasBInputAmount && (
            <>
              <ThemedViewV2
                light={tailwind('border-mono-light-v2-300')}
                dark={tailwind('border-mono-dark-v2-300')}
                style={tailwind('pt-5 px-5 border rounded-lg-v2')}
              >
                <PricesSectionV2
                  key='prices'
                  testID='pricerate_value'
                  priceRates={[{
                    label: translate('components/PricesSection', '1 {{token}}', {
                      token: pair.tokenA.displaySymbol
                    }),
                    value: pair.aToBRate.toFixed(8),
                    aSymbol: pair.tokenA.displaySymbol,
                    bSymbol: pair.tokenB.displaySymbol,
                    symbolUSDValue: getTokenPrice(pair.bSymbol, pair.aToBRate),
                    usdTextStyle: tailwind('text-sm')
                  },
                  {
                    label: translate('components/PricesSection', '1 {{token}}', {
                      token: pair.tokenB.displaySymbol
                    }),
                    value: pair.bToARate.toFixed(8),
                    aSymbol: pair.tokenB.displaySymbol,
                    bSymbol: pair.tokenA.displaySymbol,
                    symbolUSDValue: getTokenPrice(pair.aSymbol, pair.bToARate),
                    usdTextStyle: tailwind('text-sm')
                  }
                  ]}
                />
                <ThemedViewV2
                  light={tailwind('border-mono-light-v2-300')}
                  dark={tailwind('border-mono-dark-v2-300')}
                  style={tailwind('pt-5 border-t-0.5')}
                >
                  <NumberRowV2
                    lhs={{
                      value: translate('screens/AddLiquidity', 'Resulting LP tokens'),
                      testID: 'resulting_lp_tokens',
                      themedProps: {
                        light: tailwind('text-mono-light-v2-700'),
                        dark: tailwind('text-mono-dark-v2-700')
                      }
                    }}
                    rhs={{
                      value: sharePercentage.times(pair.totalLiquidity.token).toFixed(8),
                      testID: 'resulting_lp_tokens_value',
                      usdAmount: getTokenPrice(pair.aSymbol, new BigNumber(tokenAAmount)).plus(getTokenPrice(pair.bSymbol, new BigNumber(tokenBAmount))),
                      textStyle: tailwind('font-semibold-v2'),
                      usdTextStyle: tailwind('text-sm')
                    }}
                  />
                </ThemedViewV2>
              </ThemedViewV2>
              <View style={tailwind('items-center pt-12 px-5')}>
                <ThemedTextV2
                  testID='transaction_details_hint_text'
                  light={tailwind('text-mono-light-v2-500')}
                  dark={tailwind('text-mono-dark-v2-500')}
                  style={tailwind('text-xs font-normal-v2 text-center')}
                >
                  {isConversionRequired
                    ? (
                      translate('screens/AddLiquidity', 'By continuing, the required amount of DFI will be converted')
                    )
                    : (
                      translate('screens/AddLiquidity', 'Review full details in the next screen')
                    )}
                </ThemedTextV2>
              </View>
            </>
          )}
        </View>

        <View style={tailwind('mt-5 mx-7')}>
          <ButtonV2
            fillType='fill'
            label={translate('components/Button', 'Continue')}
            styleProps='w-full'
            disabled={!canContinue}
            onPress={onSubmit}
            testID='button_continue_add_liq'
          />
        </View>

        {Platform.OS === 'web'
          ? (
            <BottomSheetWebWithNavV2
              modalRef={containerRef}
              screenList={ViewPoolContents}
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
          )
          : (
            <BottomSheetWithNavV2
              modalRef={bottomSheetRef}
              screenList={ViewPoolContents}
              snapPoints={modalSortingSnapPoints}
            />
          )}
      </ThemedScrollViewV2>
    </View>
  )
}

function AddLiquidityInputCard (
  props: {
    balance: BigNumber
    type: 'primary' | 'secondary'
    symbol: string
    onPercentageChange: (amount: string, type: AmountButtonTypes) => void
    onChange: (amount: string) => void
    current: string
    status?: TransactionCardStatus
    setIsInputFocus: any // TODO: type checking
    showInsufficientTokenMsg: boolean
    showUTXOFeesMsg: boolean
    hasInputAmount?: boolean
  }): JSX.Element {
  const Icon = getNativeIcon(props.symbol)
  const isFocus = props.setIsInputFocus
  return (
    <>
      <TransactionCard
        maxValue={props.balance}
        onChange={(amount, type) => {
          props.onChange(amount)
          props.onPercentageChange(amount, type)
        }}
        status={props.status}
        amountButtonsStyle={tailwind('border-t-0.5')}
        containerStyle={tailwind('pl-5 pr-5 mr-px rounded-t-lg-v2')}
      >
        <ThemedViewV2
          light={tailwind('border-mono-light-v2-300')}
          dark={tailwind('border-mono-dark-v2-300')}
          style={tailwind('flex flex-row items-center py-2.5')}
        >
          <View>
            <Icon height={20} width={20} />
          </View>
          <WalletTransactionCardTextInput
            onFocus={isFocus}
            onBlur={isFocus}
            onChangeText={txt => props.onChange(txt)}
            placeholder='0.00'
            value={props.current}
            inputType='numeric'
            displayClearButton={props.current !== ''}
            onClearButtonPress={() => props.onChange('')}
            titleTestID={`token_input_${props.type}_title`}
            testID={`token_input_${props.type}`}
            inputContainerStyle={tailwind('pl-2')}
          />
        </ThemedViewV2>å
      </TransactionCard>

      <View
        style={tailwind('pt-0.5 pb-6')}
        testID={`${props.symbol}_display_input_text`}
      >
        {!props.showInsufficientTokenMsg && !props.showUTXOFeesMsg && (
          <InputHelperTextV2
            testID={`token_balance_${props.type}`}
            label={`${translate('screens/AddLiquidity', 'Available')}: `}
            content={BigNumber.max(props.balance, 0).toFixed(8)}
            suffix={` ${props.symbol}`}
          />
        )}
        {props.showInsufficientTokenMsg && (
          <ThemedTextV2
            light={tailwind('text-red-v2')}
            dark={tailwind('text-red-v2')}
            style={tailwind('px-4 pt-1 text-xs font-normal-v2')}
            testID={`${props.symbol}_insufficient_token_display_msg`}
          >
            {translate('screens/AddLiquidity', 'Insufficient balance')}
          </ThemedTextV2>
        )}
        {!props.showInsufficientTokenMsg && props.showUTXOFeesMsg && (
          <View
            style={tailwind('pl-2 pt-1')}
            testID={`${props.symbol}_reserved_info_text`}
          >
            <ReservedDFIInfoTextV2 />
          </View>
        )}
      </View>
    </>
  )
}

// just leave it as it is now, will be moved to network drawer
function canAddLiquidity (pair: ExtPoolPairData, tokenAAmount: BigNumber, tokenBAmount: BigNumber, balanceA: BigNumber | undefined, balanceB: BigNumber | undefined): boolean {
  if (tokenAAmount.isNaN() || tokenBAmount.isNaN()) {
    // empty string, use still input-ing
    return false
  }

  if (tokenAAmount.lte(0) || tokenBAmount.lte(0)) {
    return false
  }

  if (tokenAAmount.gt(pair.tokenA.reserve) || tokenBAmount.gt(pair.tokenB.reserve)) {
    return false
  }

  return !(balanceA === undefined || balanceA.lt(tokenAAmount) ||
    balanceB === undefined || balanceB.lt(tokenBAmount))
}
