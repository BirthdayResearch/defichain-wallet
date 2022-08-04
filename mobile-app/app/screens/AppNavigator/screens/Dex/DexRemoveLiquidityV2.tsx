import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Platform, View } from 'react-native'
import { useSelector } from 'react-redux'
import { ThemedScrollView, ThemedTextV2, ThemedViewV2, ThemedTouchableOpacityV2, ThemedIcon } from '@components/themed'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { tokenSelector } from '@store/wallet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { BottomSheetWebWithNavV2, BottomSheetWithNavV2 } from '@components/BottomSheetWithNavV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ViewPoolHeader } from './components/ViewPoolHeader'
import { ViewPoolDetails } from './components/ViewPoolDetails'
import { TransactionCardWalletTextInputV2 } from '@components/TransactionCardWalletTextInputV2'
import { TransactionCard } from '@components/TransactionCard'
import { getNativeIcon } from '@components/icons/assets'
import { InputHelperTextV2 } from '@components/InputHelperText'
import { PricesSectionV2 } from '@components/PricesSectionV2'
import { useTokenPrice } from '../Portfolio/hooks/TokenPrice'
import { NumberRowV2 } from '@components/NumberRowV2'
import { ButtonV2 } from '@components/ButtonV2'

type Props = StackScreenProps<DexParamList, 'RemoveLiquidity'>

export function RemoveLiquidityScreenV2 (props: Props): JSX.Element {
  const logger = useLogger()
  const client = useWhaleApiClient()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const { getTokenPrice } = useTokenPrice()
  // this component state
  const [tokenAAmount, setTokenAAmount] = useState<BigNumber>(new BigNumber(0))
  const [tokenBAmount, setTokenBAmount] = useState<BigNumber>(new BigNumber(0))
  const [valid, setValidity] = useState(false)
  // ratio, before times 100
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0)) // to construct tx
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  // transaction card component UI
  const [tokenTransactionCardStatus, setTokenTransactionCardStatus] = useState<'error' | 'active' | ' undefined'>()
  const [hasError, setHasError] = useState(false)
  const [isInputFocus, setIsInputFocus] = useState(false)
  const [tokenToRemove, setTokenToRemove] = useState<string>('')

  // breakdown summary state
  const [hasInputAmount, setHasInputAmount] = useState(false)

  // gather required data
  const { pair, pairInfo } = props.route.params
  const tokenA = useSelector((state: RootState) => tokenSelector(state.wallet, pair.tokenA.id))
  const tokenB = useSelector((state: RootState) => tokenSelector(state.wallet, pair.tokenB.id))

  useEffect(() => {
    setTokenTransactionCardStatus(hasError ? 'error' : isInputFocus ? 'active' : undefined)
  }, [hasError, isInputFocus])

  const removeLiquidity = (): void => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    navigation.navigate('RemoveLiquidityConfirmScreen', { amount, pair, tokenAAmount, tokenBAmount, fee, tokenA, tokenB })
  }

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    setValidity(
      new BigNumber(tokenToRemove).isGreaterThan(new BigNumber(0)) &&
      new BigNumber(tokenToRemove).isLessThanOrEqualTo(new BigNumber(pairInfo.amount)) &&
      !hasPendingJob &&
      !hasPendingBroadcastJob
    )
  }, [tokenToRemove])

  const bottomSheetRef = useRef<BottomSheetModalMethods>(null)
  const [isModalDisplayed, setIsModalDisplayed] = useState(false)
  const containerRef = useRef(null)
  const ref = useRef(null)
  const { isLight } = useThemeContext()
  const modalSortingSnapPoints = { ios: ['50%'], android: ['50%'] }

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

  const BottomSheetHeader = {
    headerStatusBarHeight: 1,
    headerTitle: '',
    headerBackTitleVisible: false,
    headerStyle: tailwind('rounded-t-xl-v2', {
      'bg-mono-light-v2-100': isLight,
      'bg-mono-dark-v2-100': !isLight
    }),
    headerRight: (): JSX.Element => {
      return (
        <ThemedTouchableOpacityV2
          style={tailwind('border-0 mr-5 mt-5')} onPress={() => dismissModal()}
          testID='close_bottom_sheet_button'
        >
          <ThemedIcon iconType='Feather' name='x-circle' size={20} />
        </ThemedTouchableOpacityV2>
      )
    }
  }

  const ViewPoolContents = useMemo(() => {
    return [
      {
        stackScreenName: 'ViewPoolShare',
        component: ViewPoolDetails({
          dataRoutes: 'remove',
          pairData: pair,
          pairInfo: pairInfo
          // totalPooledTokenA: totalTokenA,
          // totalPooledTokenB: totalTokenB
        }),
        option: BottomSheetHeader
      }
    ]
  }, [isLight])

  // Amount Input function
  const buildSummary = useCallback((amountString: string): void => {
    // this must round down, avoid attempt remove more than selected (or even available)
    const toRemove = new BigNumber(amountString)
    const ratioToTotal = toRemove.div(pair.totalLiquidity.token)
    // assume defid will trim the dust values too
    const tokenA = ratioToTotal.times(pair.tokenA.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    const tokenB = ratioToTotal.times(pair.tokenB.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    setAmount(toRemove)
    setTokenAAmount(tokenA)
    setTokenBAmount(tokenB)
    setTokenToRemove(amountString)
  }, [pair])

  useEffect(() => {
    if (new BigNumber(tokenToRemove).isGreaterThan(new BigNumber(pairInfo.amount))) {
      setHasError(true)
    } else {
      setHasError(false)
    }
  }, [tokenToRemove, pairInfo.amount])

  useEffect(() => {
    if (tokenToRemove.length > 0) {
      setHasInputAmount(true)
    } else {
      setHasInputAmount(false)
    }
  }, [tokenToRemove])

  const sharesUsdAmount = getTokenPrice(pair.tokenA.displaySymbol, new BigNumber(tokenAAmount)).plus(getTokenPrice(pair.tokenB.displaySymbol, new BigNumber(tokenBAmount)))

  return (
    <View ref={containerRef} style={tailwind('flex-1')}>
      <ThemedScrollView ref={ref} contentContainerStyle={tailwind('py-8 mx-5 justify-between', { 'h-full': !hasInputAmount })} style={tailwind('w-full')}>
        <View>
          <ViewPoolHeader
            tokenASymbol={pair.tokenA.displaySymbol}
            tokenBSymbol={pair.tokenB.displaySymbol}
            headerLabel={translate('screens/RemoveLiquidity', 'View pool share')}
            onPress={() => expandModal()}
          />
          <View style={tailwind('mt-8')}>
            <DexInputCard
              tokenA={pair.tokenA.displaySymbol}
              tokenB={pair.tokenB.displaySymbol}
              balance={new BigNumber(pairInfo.amount)}
              current={tokenToRemove}
              onChange={(amount) => {
                buildSummary(amount)
              }}
              symbol={pair?.tokenA?.displaySymbol}
              type='primary'
              setIsInputFocus={setIsInputFocus}
              status={tokenTransactionCardStatus}
              showErrMsg={hasError}
            />
          </View>
          {hasInputAmount &&
            (
              <>
                <View style={tailwind('pb-2')}>
                  <ThemedViewV2
                    light={tailwind('border-mono-light-v2-300')}
                    dark={tailwind('border-mono-dark-v2-300')}
                    style={tailwind('px-5 py-5 border rounded-2xl-v2')}
                  >
                    <PricesSectionV2
                      key='prices'
                      equalSymbol={false}
                      testID='pricerate_value'
                      priceRates={[
                      {
                        label: translate('components/PricesSection', '{{token}} to receive', {
                          token: pair.tokenA.displaySymbol
                        }),
                        value: tokenAAmount.toFixed(8),
                        aSymbol: pair.tokenA.displaySymbol,
                        symbolUSDValue: getTokenPrice(pair.tokenA.symbol, tokenAAmount),
                        usdTextStyle: tailwind('text-sm')
                      },
                      {
                        label: translate('components/PricesSection', '{{token}} to receive', {
                          token: pair.tokenB.displaySymbol
                        }),
                        value: tokenBAmount.toFixed(8),
                        aSymbol: pair.tokenB.displaySymbol,
                        symbolUSDValue: getTokenPrice(pair.tokenB.symbol, tokenBAmount),
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
                          value: translate('components/PricesSection', 'LP tokens to remove'),
                          testID: 'shares_to_add',
                          lightTextStyle: tailwind('text-mono-light-v2-500'),
                          darkTextStyle: tailwind('text-mono-dark-v2-500')
                        }}
                        rhs={{
                          value: amount.toFixed(8),
                          testID: 'shares_to_add_value',
                          usdAmount: sharesUsdAmount.isNaN() ? new BigNumber(0) : sharesUsdAmount,
                          textStyle: tailwind('font-bold-v2'),
                          usdTextStyle: tailwind('text-sm')
                        }}
                      />
                    </ThemedViewV2>
                  </ThemedViewV2>
                </View>
                <View style={tailwind('items-center')}>
                  <ThemedTextV2
                    testID='transaction_details_hint_text'
                    light={tailwind('text-mono-light-v2-500')}
                    dark={tailwind('text-mono-dark-v2-500')}
                    style={tailwind('text-xs font-normal-v2 pt-4')}
                  >
                    {translate('screens/RemoveLiquidity', 'Review full details in the next screen')}
                  </ThemedTextV2>
                </View>
              </>
            )}
        </View>

        <View style={tailwind('mt-5 mx-4')}>
          <ButtonV2
            fill='fill' label={translate('components/Button', 'Continue')}
            styleProps='w-full'
            disabled={!valid}
            onPress={removeLiquidity}
            testID='button_continue_convert'
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
              enablePanDown
            />
          )}
      </ThemedScrollView>
    </View>
  )
}

function DexInputCard (
  props: {
    tokenA: string
    tokenB: string
    balance: BigNumber
    type: 'primary' | 'secondary'
    symbol: string
    onChange: (amount: string) => void
    current: string
    status?: string
    setIsInputFocus: any // TODO: double check type
    showErrMsg: boolean
  }): JSX.Element {
    const IconA = getNativeIcon(props.tokenA)
    const IconB = getNativeIcon(props.tokenB)
    const isFocus = props.setIsInputFocus
  return (
    <>
      <TransactionCard
        maxValue={props.balance}
        onChange={(amount) => {
          props.onChange(amount)
        }}
        status={props.status}
      >
        <ThemedViewV2
          light={tailwind('border-mono-light-v2-300')}
          dark={tailwind('border-mono-dark-v2-300')}
          style={tailwind('flex flex-row items-center py-2')}
        >
          <View style={tailwind('z-50')}>
            <IconA height={20} width={20} style={tailwind('relative z-50')} />
            <IconB height={20} width={20} style={tailwind('absolute ml-3 z-40')} />
          </View>
          <TransactionCardWalletTextInputV2
            onFocus={isFocus}
            onBlur={isFocus}
            onChangeText={txt => props.onChange(txt)}
            placeholder='0.00'
            style={tailwind('flex-grow w-2/5')}
            value={props.current}
            inputType='numeric'
            displayClearButton={props.current !== ''}
            onClearButtonPress={() => props.onChange('')}
            titleTestID={`token_input_${props.type}_title`}
            testID={`token_input_${props.type}`}
          />
        </ThemedViewV2>
      </TransactionCard>

      <View style={tailwind('pt-0.5 pb-6')}>
        {props.showErrMsg
          ? (
            <ThemedTextV2
              light={tailwind('text-red-v2')}
              dark={tailwind('text-red-v2')}
              style={tailwind('px-4 text-sm')}
            >
              {`${translate('screens/AddLiquidity', 'Insufficient balance')}`}
            </ThemedTextV2>
          )
          : (
            <InputHelperTextV2
              testID={`token_balance_${props.type}`}
              label={`${translate('screens/AddLiquidity', 'Available')}: `}
              content={BigNumber.max(props.balance, 0).toFixed(8)}
              suffix=' LP tokens'
            />
          )}
      </View>
    </>
  )
}
