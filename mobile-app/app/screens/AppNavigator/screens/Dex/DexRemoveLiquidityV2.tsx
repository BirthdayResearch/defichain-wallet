import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import Slider from '@react-native-community/slider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react'
import { StyleProp, TouchableOpacity, ViewStyle, Platform, TextStyle, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Button } from '@components/Button'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView, ThemedTextV2, ThemedTouchableOpacityV2, ThemedIcon, ThemedViewV2 } from '@components/themed'
import { TokenBalanceRow } from '@components/TokenBalanceRow'
import { WalletTextInput } from '@components/WalletTextInput'
import { TokenIconPair } from '@components/TokenIconPair'
import { PricesSection } from '@components/PricesSection'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { tokenSelector, tokensSelector, WalletToken } from '@store/wallet'
import { getNativeIcon } from '@components/icons/assets'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { BottomSheetWebWithNavV2, BottomSheetWithNavV2 } from '@components/BottomSheetWithNavV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { PortfolioButtonGroupTabKey } from '@screens/AppNavigator/screens/Portfolio/components/TotalPortfolio'
import { useDenominationCurrency } from '@screens/AppNavigator/screens/Portfolio/hooks/PortfolioCurrency'
import { useTokenPrice } from '@screens/AppNavigator/screens/Portfolio/hooks/TokenPrice'
import { ViewPoolAmountRow } from './components/ViewPoolAmountRow'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { ViewPoolHeader } from './components/ViewPoolHeader'

type Props = StackScreenProps<DexParamList, 'RemoveLiquidity'>

export function RemoveLiquidityScreenV2 (props: Props): JSX.Element {
  const logger = useLogger()
  const client = useWhaleApiClient()

  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  // this component state
  const [tokenAAmount, setTokenAAmount] = useState<BigNumber>(new BigNumber(0))
  const [tokenBAmount, setTokenBAmount] = useState<BigNumber>(new BigNumber(0))
  const [valid, setValidity] = useState(false)
  // ratio, before times 100
  const [percentage, setPercentage] = useState<string>('')
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0)) // to construct tx
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const displayedPercentage = percentage === '' || percentage === undefined ? '0.00' : percentage

  // gather required data
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const { pair, pairInfo, totalTokenA, totalTokenB } = props.route.params
  const lmToken = tokens.find(token => token.symbol === pair.symbol) as AddressToken
  const tokenAPerLmToken = new BigNumber(pair.tokenB.reserve).div(pair.tokenA.reserve)
  const tokenBPerLmToken = new BigNumber(pair.tokenA.reserve).div(pair.tokenB.reserve)
  const tokenA = useSelector((state: RootState) => tokenSelector(state.wallet, pair.tokenA.id))
  const tokenB = useSelector((state: RootState) => tokenSelector(state.wallet, pair.tokenB.id))

  const setInputPercentage = (percentage: string): void => {
    // this must round down, avoid attempt remove more than selected (or even available)
    const toRemove = new BigNumber(percentage).div(100).times(lmToken.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
    const ratioToTotal = toRemove.div(pair.totalLiquidity.token)
    // assume defid will trim the dust values too
    const tokenA = ratioToTotal.times(pair.tokenA.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    const tokenB = ratioToTotal.times(pair.tokenB.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    setAmount(toRemove)
    setTokenAAmount(tokenA)
    setTokenBAmount(tokenB)
    setPercentage(percentage)
  }

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
      new BigNumber(percentage).isGreaterThan(new BigNumber(0)) &&
      new BigNumber(percentage).isLessThanOrEqualTo(new BigNumber(100)) &&
      !hasPendingJob &&
      !hasPendingBroadcastJob
    )
  }, [percentage])

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
        component: ViewPoolContentsDetails({
          tokenA: pair.tokenA.displaySymbol,
          tokenB: pair.tokenB.displaySymbol,
          pairData: pair,
          poolInfo: pairInfo,
          totalPooledTokenA: totalTokenA,
          totalPooledTokenB: totalTokenB
        }),
        option: BottomSheetHeader
      }
    ]
  }, [isLight])

  return (
    <View ref={containerRef} style={tailwind('flex-1')}>
      <ThemedScrollView ref={ref} style={tailwind('w-full flex-col')}>
        <ViewPoolHeader
          tokenASymbol={pair.tokenA.displaySymbol}
          tokenBSymbol={pair.tokenB.displaySymbol}
          headerLabel={translate('screens/RemoveLiquidity', 'View pool share')}
          onPress={() => expandModal()}
        />
        <ThemedView style={tailwind('w-full mt-6')}>
          <ThemedText
            style={tailwind('text-base ml-4 mb-2')}
          >
            {translate('screens/RemoveLiquidity', 'Drag or enter amount to remove')}
          </ThemedText>
          <AmountSlider
            current={Number(percentage)}
            onChange={setInputPercentage}
            viewStyle={tailwind('p-4')}
          />
          <ThemedView
            dark={tailwind('bg-gray-800')}
            light={tailwind('bg-white')}
            style={tailwind('w-full flex-row p-4 items-stretch')}
          >
            <WalletTextInput
              inputType='numeric'
              onChange={(event) => {
                setInputPercentage(event.nativeEvent.text)
              }}
              testID='text_input_percentage'
              placeholder={translate('screens/RemoveLiquidity', 'Enter an amount ')}
              value={percentage}
              keyboardType='numeric'
              containerStyle='w-full'
              style={tailwind('flex-grow')}
              inlineText={{
                type: 'helper',
                text: <HelperText displayedPercentage={displayedPercentage} />
              }}
            >
              <TokenIconPair
                iconA={pair?.tokenA.displaySymbol}
                iconB={pair?.tokenB?.displaySymbol}
              />
            </WalletTextInput>
          </ThemedView>
        </ThemedView>

        <ThemedSectionTitle
          testID='remove_liq_title'
          text={translate('screens/RemoveLiquidity', 'YOU ARE REMOVING')}
        />
        <TokenBalanceRow
          lhs={pair?.tokenA?.displaySymbol}
          rhs={{
            value: tokenAAmount.toFixed(8),
            testID: 'price_a'
          }}
        />
        <TokenBalanceRow
          lhs={pair?.tokenB?.displaySymbol}
          rhs={{
            value: tokenBAmount.toFixed(8),
            testID: 'price_b'
          }}
        />
        <PricesSection
          testID='pricerate_value'
          priceRates={[
            {
              label: translate('components/PricesSection', '1 {{token}}', {
                token: pair.tokenA.displaySymbol
              }),
              value: tokenAPerLmToken.toFixed(8),
              aSymbol: pair.tokenA.displaySymbol,
              bSymbol: pair.tokenB.displaySymbol
            },
            {
              label: translate('components/PricesSection', '1 {{token}}', {
                token: pair.tokenB.displaySymbol
              }),
              value: tokenBPerLmToken.toFixed(8),
              aSymbol: pair.tokenB.displaySymbol,
              bSymbol: pair.tokenA.displaySymbol
            }

          ]}
          sectionTitle='PRICES'
        />
        <ThemedText
          light={tailwind('text-gray-600')}
          dark={tailwind('text-gray-300')}
          style={tailwind('pt-2 pb-8 px-4 text-sm')}
        >
          {translate('screens/RemoveLiquidity', 'Review full transaction details in the next screen')}
        </ThemedText>

        <ContinueButton
          enabled={valid}
          onPress={removeLiquidity}
        />

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
      </ThemedScrollView>
    </View>
  )
}

function AmountSlider (props: { current: number, onChange: (percentage: string) => void, viewStyle: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <ThemedView
      dark={tailwind('bg-gray-800 border-b border-gray-700')}
      light={tailwind('bg-white border-b border-gray-200')}
      style={[tailwind('flex-row items-center'), props.viewStyle]}
    >
      <TouchableOpacity
        onPress={() => props.onChange('0.00')}
        testID='button_slider_min'
      >
        <ThemedText
          dark={tailwind('text-gray-300')}
          light={tailwind('text-gray-500')}
          style={tailwind(' text-xs')}
        >
          {translate('components/slider', 'None')}
        </ThemedText>
      </TouchableOpacity>

      <View style={tailwind('flex-1 ml-4 mr-4')}>
        <Slider
          maximumValue={100}
          minimumTrackTintColor='#ff00af'
          minimumValue={0}
          onSlidingComplete={(val) => props.onChange(new BigNumber(val).toFixed(2))}
          testID='slider_remove_liq_percentage'
          thumbTintColor='#ff00af'
          value={isNaN(props.current) ? 0 : props.current}
        />
      </View>

      <TouchableOpacity
        onPress={() => props.onChange('100.00')}
        testID='button_slider_max'
      >
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={tailwind('text-xs')}
        >
          {translate('components/slider', 'Max')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

function HelperText (props: { displayedPercentage: string }): JSX.Element {
  return (
    <ThemedView
      light={tailwind('bg-transparent')}
      dark={tailwind('bg-transparent')}
      style={tailwind('flex-row mt-2')}
    >
      <ThemedText style={tailwind('text-sm')}>{`${translate('screens/RemoveLiquidity', 'You are removing')} `}</ThemedText>
      <ThemedText style={tailwind('text-sm font-semibold')}>{`${props.displayedPercentage}% `}</ThemedText>
      <ThemedText style={tailwind('text-sm')}>{translate('screens/RemoveLiquidity', 'from liquidity pool')}</ThemedText>
    </ThemedView>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  return (
    <Button
      disabled={!props.enabled}
      label={translate('components/Button', 'CONTINUE')}
      onPress={props.onPress}
      testID='button_continue_remove_liq'
      title='continue'
    />
  )
}

interface ViewPoolContentsDetailsProps {
  tokenA: string
  tokenB: string
  pairData: PoolPairData
  poolInfo: WalletToken
  totalPooledTokenA: string
  totalPooledTokenB: string
  infoIconStyle?: StyleProp<TextStyle>
}

const ViewPoolContentsDetails = (props: ViewPoolContentsDetailsProps): React.MemoExoticComponent<() => JSX.Element> => memo(() => {
  const TokenIconA = getNativeIcon(props.tokenA)
  const TokenIconB = getNativeIcon(props.tokenB)

  const { denominationCurrency } = useDenominationCurrency()
    const { getTokenPrice } = useTokenPrice()
    const getUSDValue = (
      amount: BigNumber,
      symbol: string,
      isLPs: boolean = false
    ): BigNumber => {
      return getTokenPrice(symbol, amount, isLPs)
  }

  return (
    <ThemedViewV2
      light={tailwind('bg-mono-light-v2-100')}
      dark={tailwind('bg-mono-dark-v2-100')}
      style={tailwind('px-5 h-full')}
    >
      <View style={tailwind('flex-row mb-3')}>
        <View>
          <TokenIconA style={tailwind('absolute z-50')} width={32} height={32} />
          <TokenIconB style={tailwind('ml-5 z-40')} width={32} height={32} />
        </View>
        <ThemedTextV2
          dark={tailwind('text-mono-dark-v2-900')}
          light={tailwind('text-mono-light-v2-900')}
          style={tailwind('pl-1 text-2xl font-semibold')}
        >
          {`${props.tokenA}-${props.tokenB}`}
        </ThemedTextV2>
      </View>

      <View style={tailwind('mt-5')}>
        <View style={tailwind('mb-3')}>
          <ViewPoolAmountRow
            label={translate('screens/RemoveLiquidity', 'Pool share')}
            amount={props.poolInfo.amount}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-900'),
              light: tailwind('text-mono-light-v2-900')
            }}
            suffix={` ${props.poolInfo.displaySymbol}`}
            testID='Pool_share_amount'
          />
          <ViewPoolAmountRow
            amount='3.123'
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-700'),
              light: tailwind('text-mono-light-v2-700')
            }}
            prefix='('
            suffix='%)'
            testID='Pool_share_amount'
          />
        </View>
        <View style={tailwind('mb-3')}>
          <ViewPoolAmountRow
            label={translate('screens/RemoveLiquidity', `Pooled ${props.pairData.tokenA.displaySymbol}`)}
            amount={props.totalPooledTokenA}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-900'),
              light: tailwind('text-mono-light-v2-900')
            }}
            testID='Pool_share_amount'
          />
          <ViewPoolAmountRow
            amount={getUSDValue(new BigNumber(props.totalPooledTokenA), props.pairData.tokenA.symbol).toFixed(2)}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-700'),
              light: tailwind('text-mono-light-v2-700')
            }}
            prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
            suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
            testID='Pool_share_amount'
          />
        </View>
        <View style={tailwind('mb-3')}>
          <ViewPoolAmountRow
            label={translate('screens/RemoveLiquidity', `Pooled ${props.pairData.tokenB.displaySymbol}`)}
            amount={props.totalPooledTokenB}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-900'),
              light: tailwind('text-mono-light-v2-900')
            }}
            testID='Pool_share_amount'
          />
          <ViewPoolAmountRow
            amount={getUSDValue(new BigNumber(props.totalPooledTokenB), props.pairData.tokenB.symbol).toFixed(2)}
            valueThemeProps={{
              dark: tailwind('text-mono-dark-v2-700'),
              light: tailwind('text-mono-light-v2-700')
            }}
            prefix={denominationCurrency === PortfolioButtonGroupTabKey.USDT ? '$' : undefined}
            suffix={denominationCurrency !== PortfolioButtonGroupTabKey.USDT ? ` ${denominationCurrency}` : undefined}
            testID='Pool_share_amount'
          />
        </View>
        {props.pairData?.apr?.total !== undefined && props.pairData?.apr?.total !== null && (
          <ViewPoolAmountRow
            label='APR'
            amount={new BigNumber(isNaN(props.pairData.apr.total) ? 0 : props.pairData.apr.total).times(100).toFixed(2)}
            valueThemeProps={{
              dark: tailwind('text-darksuccess-500'),
              light: tailwind('text-success-500')
            }}
            valueTextStyle={tailwind('font-semibold-v2')}
            suffix='%'
            testID='Pool_share_amount'
          />
        )}
      </View>
    </ThemedViewV2>
  )
})
