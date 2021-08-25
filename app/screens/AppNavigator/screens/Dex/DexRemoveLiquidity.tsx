import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import Slider from '@react-native-community/slider'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Platform, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { useSelector } from 'react-redux'
import { Logging } from '../../../../api'
import { View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { NumberRow } from '../../../../components/NumberRow'
import { NumberTextInput } from '../../../../components/NumberTextInput'
import { SectionTitle } from '../../../../components/SectionTitle'
import { ThemedScrollView, ThemedText, ThemedView } from '../../../../components/themed'
import { TokenBalanceRow } from '../../../../components/TokenBalanceRow'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../store'
import { hasTxQueued as hasBroadcastQueued } from '../../../../store/ocean'
import { hasTxQueued } from '../../../../store/transaction_queue'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

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
  const [aSymbol, bSymbol] = pair.symbol.split('-') as [string, string]
  const lmToken = tokens.find(token => token.symbol === pair.symbol) as AddressToken
  const tokenAPerLmToken = new BigNumber(pair.tokenB.reserve).div(pair.tokenA.reserve)
  const tokenBPerLmToken = new BigNumber(pair.tokenA.reserve).div(pair.tokenB.reserve)

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
    navigation.navigate('RemoveLiquidityConfirmScreen', { amount, pair, tokenAAmount, tokenBAmount, fee })
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
          light='bg-white border-b border-gray-200'
          dark='bg-gray-800 border-b border-gray-700' style={tailwind('w-full flex-row p-4 items-stretch')}
        >
          <ThemedText
            style={tailwind('w-2/4 font-semibold flex-1')}
          >{translate('screens/RemoveLiquidity', 'Amount to remove')}
          </ThemedText>
          <NumberTextInput
            testID='text_input_percentage'
            style={[
              tailwind('text-right w-2/4 p-0 mr-0.5'),
              isIOS && tailwind('-mt-0.5'),
              {
                height: Math.max(24, inputHeight)
              }
            ]}
            placeholder={translate('screens/RemoveLiquidity', 'Enter an amount ')}
            value={percentage}
            multiline
            onContentSizeChange={event => {
              setInputHeight(event.nativeEvent.contentSize.height)
            }}
            onChange={(event) => {
              setInputPercentage(event.nativeEvent.text)
            }}
          />
          <ThemedText>%</ThemedText>
        </ThemedView>
        <AmountSlider
          current={Number(percentage)}
          viewStyle={tailwind('p-4')}
          onChange={setInputPercentage}
        />
      </ThemedView>
      <SectionTitle text={translate('screens/RemoveLiquidity', 'YOU ARE REMOVING')} testID='remove_liq_title' />
      <ThemedView
        light='bg-white'
        dark='bg-gray-800' style={tailwind('w-full mb-4')}
      >
        <TokenBalanceRow iconType={aSymbol} lhs={aSymbol} rhs={{ value: tokenAAmount.toFixed(8), testID: 'price_a' }} />
        <TokenBalanceRow iconType={bSymbol} lhs={bSymbol} rhs={{ value: tokenBAmount.toFixed(8), testID: 'price_b' }} />
        <NumberRow
          lhs={translate('screens/AddLiquidity', 'Price')}
          rightHandElements={[
            {
              value: tokenAPerLmToken.toFixed(8),
              testID: 'text_a_to_b_price',
              suffix: ` ${bSymbol} per ${aSymbol}`
            },
            {
              value: tokenBPerLmToken.toFixed(8),
              testID: 'text_b_to_a_price',
              suffix: ` ${aSymbol} per ${bSymbol}`
            }
          ]}
        />
      </ThemedView>
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
      light='bg-white border-b border-gray-200'
      dark='bg-gray-800 border-b border-gray-700'
      style={[tailwind('flex-row items-center'), props.viewStyle]}
    >
      <TouchableOpacity testID='button_slider_min' onPress={() => props.onChange('0.00')}>
        <ThemedText
          light='text-gray-500'
          dark='text-gray-300'
          style={tailwind(' text-sm')}
        >{translate('components/slider', 'None')}
        </ThemedText>
      </TouchableOpacity>
      <View style={tailwind('flex-1 ml-4 mr-4')}>
        <Slider
          testID='slider_remove_liq_percentage'
          value={isNaN(props.current) ? 0 : props.current}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor='#ff00af'
          thumbTintColor='#ff00af'
          onSlidingComplete={(val) => props.onChange(new BigNumber(val).toFixed(2))}
        />
      </View>
      <TouchableOpacity testID='button_slider_max' onPress={() => props.onChange('100.00')}>
        <ThemedText
          light='text-gray-500' dark='text-gray-400'
          style={tailwind('text-sm')}
        >{translate('components', 'All')}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
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
