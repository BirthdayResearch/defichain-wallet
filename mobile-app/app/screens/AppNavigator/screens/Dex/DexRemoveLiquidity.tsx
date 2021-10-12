import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import Slider from '@react-native-community/slider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Platform, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { useSelector } from 'react-redux'
import { Logging } from '@api'
import { View } from '@components/index'
import { Button } from '@components/Button'
import { NumberRow } from '@components/NumberRow'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedTextInput, ThemedView } from '@components/themed'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { DexParamList } from './DexNavigator'
import { tokenSelector } from '@store/wallet'

type Props = StackScreenProps<DexParamList, 'RemoveLiquidity'>

export function RemoveLiquidityScreen (props: Props): JSX.Element {
  const client = useWhaleApiClient()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const isIOS = Platform.OS === 'ios'
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  // this component state
  const [tokenAAmount, setTokenAAmount] = useState<BigNumber>(new BigNumber(0))
  const [tokenBAmount, setTokenBAmount] = useState<BigNumber>(new BigNumber(0))
  const [valid, setValidity] = useState(false)
  const [inputHeight, setInputHeight] = useState(24)
  // ratio, before times 100
  const [percentage, setPercentage] = useState<string>('')
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0)) // to construct tx
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  // gather required data
  const tokens = useTokensAPI()
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
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(Logging.error)
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
      <ThemedView style={tailwind('w-full mt-8')}>
        <ThemedView
          dark={tailwind('bg-gray-800 border-b border-gray-700')}
          light={tailwind('bg-white border-b border-gray-200')}
          style={tailwind('w-full flex-row p-4 items-stretch')}
        >
          <ThemedText
            style={tailwind('w-2/4 font-semibold flex-1')}
          >
            {translate('screens/RemoveLiquidity', 'Amount to remove')}
          </ThemedText>

          <ThemedTextInput
            multiline
            onChange={(event) => {
              setInputPercentage(event.nativeEvent.text)
            }}
            onContentSizeChange={event => {
              setInputHeight(event.nativeEvent.contentSize.height)
            }}
            placeholder={translate('screens/RemoveLiquidity', 'Enter an amount ')}
            style={[
              tailwind('text-right w-2/4 p-0 mr-0.5'),
              isIOS && tailwind('-mt-0.5'),
              {
                height: Math.max(24, inputHeight)
              }
            ]}
            testID='text_input_percentage'
            value={percentage}
            keyboardType='numeric'
          />

          <ThemedText>
            %
          </ThemedText>
        </ThemedView>

        <AmountSlider
          current={Number(percentage)}
          onChange={setInputPercentage}
          viewStyle={tailwind('p-4')}
        />
      </ThemedView>

      <ThemedSectionTitle
        testID='remove_liq_title'
        text={translate('screens/RemoveLiquidity', 'YOU ARE REMOVING')}
      />

      <NumberRow
        lhs={pair.tokenA.displaySymbol}
        rhs={{
          value: tokenAAmount.toFixed(8),
          testID: 'price_a',
          suffixType: 'text',
          suffix: pair.tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={pair.tokenB.displaySymbol}
        rhs={{
          value: tokenBAmount.toFixed(8),
          testID: 'price_b',
          suffixType: 'text',
          suffix: pair.tokenB.displaySymbol
        }}
      />
      <ThemedSectionTitle
        testID='remove_liq_price_details_title'
        text={translate('screens/RemoveLiquidity', 'PRICE DETAILS')}
      />
      <NumberRow
        lhs={translate('screens/AddLiquidity', '{{tokenA}} price per {{tokenB}}', { tokenA: pair.tokenB.displaySymbol, tokenB: pair.tokenA.displaySymbol })}
        rhs={{
          value: tokenAPerLmToken.toFixed(8),
          testID: 'text_a_to_b_price',
          suffixType: 'text',
          suffix: pair.tokenB.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/AddLiquidity', '{{tokenA}} price per {{tokenB}}', { tokenA: pair.tokenA.displaySymbol, tokenB: pair.tokenB.displaySymbol })}
        rhs={{
          value: tokenBPerLmToken.toFixed(8),
          testID: 'text_b_to_a_price',
          suffixType: 'text',
          suffix: pair.tokenA.displaySymbol
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
          style={tailwind(' text-sm')}
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
          style={tailwind('text-sm')}
        >
          {translate('components/slider', 'All')}
        </ThemedText>
      </TouchableOpacity>
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
