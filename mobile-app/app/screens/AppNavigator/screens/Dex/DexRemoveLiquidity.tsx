import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import Slider from '@react-native-community/slider'
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { View } from '@components/index'
import { Button } from '@components/Button'
import { NumberRow } from '@components/NumberRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { TokenBalanceRow } from '@components/TokenBalanceRow'
import { WalletTextInput } from '@components/WalletTextInput'
import { TokenIconPair } from '@components/TokenIconPair'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { fetchTokens, tokenSelector, tokensSelector } from '@store/wallet'
import { useWalletContext } from '@shared-contexts/WalletContext'

type Props = StackScreenProps<DexParamList, 'RemoveLiquidity'>

export function RemoveLiquidityScreen (props: Props): JSX.Element {
  const logger = useLogger()
  const client = useWhaleApiClient()
  const { address } = useWalletContext()
  const dispatch = useDispatch()
  const isFocused = useIsFocused()

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
  const blockCount = useSelector((state: RootState) => state.block.count)
  const tokens = useSelector((state: RootState) => tokensSelector(state.wallet))
  const { pair } = props.route.params
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
    if (isFocused) {
      dispatch(fetchTokens({ client, address }))
    }
  }, [address, blockCount, isFocused])

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

  return (
    <ThemedScrollView style={tailwind('w-full flex-col flex-1')}>
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

      <ThemedSectionTitle
        testID='remove_liq_price_details_title'
        text={translate('screens/RemoveLiquidity', 'PRICE DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/RemoveLiquidity', '{{tokenB}} price in {{tokenA}}', { tokenA: pair.tokenA.displaySymbol, tokenB: pair.tokenB.displaySymbol })}
        rhs={{
          value: tokenBPerLmToken.toFixed(8),
          testID: 'text_b_to_a_price',
          suffixType: 'text',
          suffix: translate('screens/RemoveLiquidity', '{{symbolA}} per {{symbolB}}', { symbolA: pair.tokenA.displaySymbol, symbolB: pair.tokenB.displaySymbol })
        }}
      />
      <NumberRow
        lhs={translate('screens/RemoveLiquidity', '{{tokenA}} price in {{tokenB}}', { tokenA: pair.tokenA.displaySymbol, tokenB: pair.tokenB.displaySymbol })}
        rhs={{
          value: tokenAPerLmToken.toFixed(8),
          testID: 'text_a_to_b_price',
          suffixType: 'text',
          suffix: translate('screens/RemoveLiquidity', '{{symbolB}} per {{symbolA}}', { symbolB: pair.tokenB.displaySymbol, symbolA: pair.tokenA.displaySymbol })
        }}
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
    </ThemedScrollView>
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

function HelperText (props: {displayedPercentage: string}): JSX.Element {
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
