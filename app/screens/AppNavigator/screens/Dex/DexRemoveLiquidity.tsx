import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import Slider from '@react-native-community/slider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Logging } from '../../../../api'
import { Text, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { getNativeIcon } from '../../../../components/icons/assets'
import { SectionTitle } from '../../../../components/SectionTitle'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { hasTxQueued } from '../../../../store/transaction_queue'
import { hasTxQueued as hasBoardcastQueued } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'RemoveLiquidity'>

export function RemoveLiquidityScreen (props: Props): JSX.Element {
  const client = useWhaleApiClient()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBoardcastQueued(state.ocean))
  // this component state
  const [tokenAAmount, setTokenAAmount] = useState<BigNumber>(new BigNumber(0))
  const [tokenBAmount, setTokenBAmount] = useState<BigNumber>(new BigNumber(0))
  // ratio, before times 100
  const [percentage, setPercentage] = useState<string>('0') // for display
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0)) // to construct tx
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  // gather required data
  const tokens = useTokensAPI()
  const { pair } = props.route.params
  const [aSymbol, bSymbol] = pair.symbol.split('-') as [string, string]
  const lmToken = tokens.find(token => token.symbol === pair.symbol) as AddressToken
  const tokenAPerLmToken = new BigNumber(pair.tokenB.reserve).div(pair.tokenA.reserve)
  const tokenBPerLmToken = new BigNumber(pair.tokenA.reserve).div(pair.tokenB.reserve)

  const setSliderPercentage = (percentage: number): void => {
    // this must round down, avoid attempt remove more than selected (or even available)
    const toRemove = new BigNumber(percentage).div(100).times(lmToken.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
    const ratioToTotal = toRemove.div(pair.totalLiquidity.token)
    // assume defid will trim the dust values too
    const tokenA = ratioToTotal.times(pair.tokenA.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    const tokenB = ratioToTotal.times(pair.tokenB.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    setAmount(toRemove)
    setTokenAAmount(tokenA)
    setTokenBAmount(tokenB)
    setPercentage(new BigNumber(percentage).toFixed(2))
  }

  const removeLiquidity = (): void => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    navigation.navigate('RemoveLiquidityConfirmScreen', { amount, pair, tokenAAmount, tokenBAmount, fee })
  }

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(Logging.error)
  }, [])

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <View style={tailwind('w-full bg-white mt-8')}>
        <View style={tailwind('w-full flex-row p-4')}>
          <Text
            style={tailwind('flex-1 font-semibold')}
          >{translate('screens/RemoveLiquidity', 'Amount to remove')}
          </Text>
          <Text testID='text_slider_percentage' style={tailwind('text-right')}>{percentage}%</Text>
        </View>
        <AmountSlider
          current={Number(percentage)}
          viewStyle={tailwind('p-4')}
          onChange={setSliderPercentage}
        />
      </View>
      <SectionTitle text={translate('screens/RemoveLiquidity', 'YOU ARE REMOVING')} testID='remove_liq_title' />
      <View style={tailwind('w-full bg-white mb-4')}>
        <CoinAmountRow symbol={aSymbol} amount={tokenAAmount} />
        <CoinAmountRow symbol={bSymbol} amount={tokenBAmount} />
        <View style={tailwind('bg-white p-2 border-t border-gray-200 flex-row items-start w-full')}>
          <View style={tailwind('flex-1 ml-2')}>
            <Text style={tailwind('font-medium')}>{translate('screens/AddLiquidity', 'Price')}</Text>
          </View>
          <View style={tailwind('flex-1 mr-2')}>
            <NumberFormat
              value={tokenAPerLmToken.toFixed(8)} decimalScale={8} thousandSeparator displayType='text'
              suffix={` ${bSymbol} per ${aSymbol}`}
              renderText={(val) => (
                <Text
                  testID='text_a_to_b_price'
                  style={tailwind('font-medium text-right text-gray-500')}
                >
                  {val}
                </Text>
              )}
            />
            <NumberFormat
              value={tokenBPerLmToken.toFixed(8)} decimalScale={8} thousandSeparator displayType='text'
              suffix={` ${aSymbol} per ${bSymbol}`}
              renderText={(val) => (
                <Text
                  testID='text_b_to_a_price'
                  style={tailwind('font-medium text-right text-gray-500')}
                >
                  {val}
                </Text>
              )}
            />
          </View>
        </View>
      </View>
      <ContinueButton
        enabled={Number(percentage) !== 0 && !hasPendingJob && !hasPendingBroadcastJob}
        onPress={removeLiquidity}
      />
    </ScrollView>
  )
}

function AmountSlider (props: { current: number, onChange: (percentage: number) => void, viewStyle: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <View style={[tailwind('flex-row items-center border-t border-gray-200'), props.viewStyle]}>
      <TouchableOpacity testID='button_slider_min' onPress={() => props.onChange(0)}>
        <Text style={tailwind('text-gray-500 text-sm')}>{translate('components/slider', 'None')}</Text>
      </TouchableOpacity>
      <View style={tailwind('flex-1 ml-4 mr-4')}>
        <Slider
          testID='slider_remove_liq_percentage'
          value={props.current}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor='#ff00af'
          thumbTintColor='#ff00af'
          onValueChange={(val) => props.onChange(val)}
        />
      </View>
      <TouchableOpacity testID='button_slider_max' onPress={() => props.onChange(100)}>
        <Text style={tailwind('text-gray-500 text-sm')}>{translate('components', 'All')}</Text>
      </TouchableOpacity>
    </View>
  )
}

function CoinAmountRow (props: { symbol: string, amount: BigNumber }): JSX.Element {
  const TokenIcon = getNativeIcon(props.symbol)
  return (
    <View style={tailwind('flex-row items-center border-t border-gray-200 p-2')}>
      <View style={tailwind('flex-row flex-1 items-center justify-start')}>
        <TokenIcon style={tailwind('ml-2')} />
        <Text testID={`remove_liq_symbol_${props.symbol}`} style={tailwind('ml-2')}>{props.symbol}</Text>
      </View>
      <NumberFormat
        value={props.amount.toFixed(8)} decimalScale={8} thousandSeparator displayType='text'
        renderText={(value) => (
          <Text
            testID={`text_coin_amount_${props.symbol}`}
            style={tailwind('flex-1 text-right text-gray-500 mr-2')}
          >
            {value}
          </Text>
        )}
      />
    </View>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind('m-2')}>
      <Button
        testID='button_continue_remove_liq'
        title='continue'
        disabled={!props.enabled}
        onPress={props.onPress}
        label={translate('components/Button', 'CONTINUE')}
      />
    </View>
  )
}
