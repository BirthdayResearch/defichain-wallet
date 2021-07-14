import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import Slider from '@react-native-community/slider'
import { StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { PrimaryButton } from '../../../../components/PrimaryButton'
import { useWallet } from '../../../../contexts/WalletContext'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'RemoveLiquidity'>

export function RemoveLiquidityScreen (props: Props): JSX.Element {
  const navigation = useNavigation()

  // this component state
  const [tokenAAmount, setTokenAAmount] = useState<BigNumber>(new BigNumber(0))
  const [tokenBAmount, setTokenBAmount] = useState<BigNumber>(new BigNumber(0))
  // ratio, before times 100
  const [percentage, setPercentage] = useState<string>('0') // for display
  const [amount, setAmount] = useState<BigNumber>(new BigNumber(0)) // to construct tx

  // gather required data
  const tokens = useTokensAPI()
  const { pair } = props.route.params as any
  const [aSymbol, bSymbol] = pair.symbol.split('-') as [string, string]
  const lmToken = tokens.find(token => token.symbol === pair.symbol) as AddressToken
  const tokenAPerLmToken = new BigNumber(pair.tokenA.reserve).div(pair.totalLiquidity)
  const tokenBPerLmToken = new BigNumber(pair.tokenB.reserve).div(pair.totalLiquidity)

  const setSliderPercentage = useCallback((percentage: number) => {
    // this must round down, avoid attempt remove more than selected (or even available)
    const toRemove = new BigNumber(percentage).div(100).times(lmToken.amount).decimalPlaces(8, BigNumber.ROUND_DOWN)
    const ratioToTotal = toRemove.div(pair.totalLiquidity)
    // assume defid will trim the dust values too
    const tokenA = ratioToTotal.times(pair.tokenA.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    const tokenB = ratioToTotal.times(pair.tokenB.reserve).decimalPlaces(8, BigNumber.ROUND_DOWN)
    setAmount(toRemove)
    setTokenAAmount(tokenA)
    setTokenBAmount(tokenB)
    setPercentage(new BigNumber(percentage).toFixed(2))
  }, [percentage])

  const whaleAPI = useWhaleApiClient()
  const account = useWallet().get(0)

  const removeLiquidity = useCallback(() => {
    // TODO: add loading spinner after we have standardized design
    constructSignedRemoveLiqAndSend(
      whaleAPI,
      account,
      Number(pair.id),
      amount
    ).then(() => {
      navigation.dispatch(StackActions.popToTop())
    }).catch(e => {
      // TODO: display error, close modal to retry/redirect
      console.log(e)
    })
  }, [amount])

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <View style={tailwind('w-full bg-white mt-8')}>
        <View style={tailwind('w-full flex-row p-4')}>
          <Text
            style={tailwind('flex-1')}
          >{translate('screens/RemoveLiquidity', 'Amount of liquidity to remove')}
          </Text>
          <Text testID='text_slider_pencentage' style={tailwind('text-right')}>{percentage} %</Text>
        </View>
        <AmountSlider
          current={Number(percentage)}
          viewStyle={tailwind('p-4')}
          onChange={setSliderPercentage}
        />
      </View>
      <View style={tailwind('w-full bg-white mt-8 mb-4')}>
        <CoinAmountRow symbol={aSymbol} amount={tokenAAmount} />
        <CoinAmountRow symbol={bSymbol} amount={tokenBAmount} />
        <View style={tailwind('bg-white p-2 border-t border-gray-200 flex-row items-start w-full')}>
          <View style={tailwind('flex-1 ml-2')}>
            <Text style={tailwind('font-medium')}>{translate('screens/AddLiquidity', 'Price')}</Text>
          </View>
          <View style={tailwind('flex-1 mr-2')}>
            <NumberFormat
              value={tokenAPerLmToken.toNumber()} decimalScale={8} thousandSeparator displayType='text'
              suffix={` ${aSymbol}`}
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
              value={tokenBPerLmToken.toNumber()} decimalScale={8} thousandSeparator displayType='text'
              suffix={` ${bSymbol}`}
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
        enabled={Number(percentage) !== 0}
        onPress={removeLiquidity}
      />
    </ScrollView>
  )
}

function AmountSlider (props: { current: number, onChange: (percentage: number) => void, viewStyle: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <View style={[tailwind('flex-row items-center border-t border-gray-200'), props.viewStyle]}>
      <TouchableOpacity testID='button_slider_min' onPress={() => props.onChange(0)}>
        <Text style={tailwind('text-gray-500 text-xs')}>{translate('components/slider', 'None')}</Text>
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
        <Text style={tailwind('text-gray-500 text-xs')}>{translate('components', 'All')}</Text>
      </TouchableOpacity>
    </View>
  )
}

function CoinAmountRow (props: { symbol: string, amount: BigNumber }): JSX.Element {
  const TokenIcon = getTokenIcon(props.symbol)
  return (
    <View style={tailwind('flex-row items-center border-t border-gray-200 p-2')}>
      <View style={tailwind('flex-row flex-1 items-center justify-start')}>
        <TokenIcon style={tailwind('ml-2')} />
        <Text style={tailwind('ml-2')}>{props.symbol}</Text>
      </View>
      <NumberFormat
        value={props.amount.toNumber()} decimalScale={8} thousandSeparator displayType='text'
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
    <PrimaryButton
      testID='button_continue_remove_liq'
      touchableStyle={tailwind('m-2')}
      title='continue'
      disabled={!props.enabled}
      onPress={props.onPress}
    >
      <Text style={tailwind('text-white font-bold')}>{translate('components/Button', 'CONTINUE')}</Text>
    </PrimaryButton>
  )
}

async function constructSignedRemoveLiqAndSend (whaleAPI: WhaleApiClient, account: WhaleWalletAccount, tokenId: number, amount: BigNumber): Promise<string> {
  const builder = account.withTransactionBuilder()
  const script = await account.getScript()
  const removeLiq = {
    script,
    tokenId,
    amount
  }
  const dfTx = await builder.liqPool.removeLiquidity(removeLiq, script)
  const hex = new CTransactionSegWit(dfTx).toHex()
  return await whaleAPI.transactions.send({ hex })
}
