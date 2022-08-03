import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Platform, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Button } from '@components/Button'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView, ThemedTouchableOpacityV2, ThemedIcon } from '@components/themed'
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
import { tokenSelector, tokensSelector } from '@store/wallet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { BottomSheetWebWithNavV2, BottomSheetWithNavV2 } from '@components/BottomSheetWithNavV2'
import { useThemeContext } from '@shared-contexts/ThemeProvider'
import { ViewPoolHeader } from './components/ViewPoolHeader'
import { ViewPoolShareDetails } from './components/ViewPoolShareDetails'

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
        component: ViewPoolShareDetails({
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
              enablePanDown
            />
          )}
      </ThemedScrollView>
    </View>
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
