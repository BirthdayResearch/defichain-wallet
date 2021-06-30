import { StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { TouchableOpacity, ViewStyle, StyleProp } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { PrimaryColorStyle } from '../../../../constants/Theme'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { DexParamList } from './DexNavigator'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleFeeRateProvider, WhalePrevoutProvider, WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder/dist'
import { SmartBuffer } from 'smart-buffer'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import Slider from '@react-native-community/slider'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'

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
  const { pair } = props.route.params
  const [aSymbol, bSymbol] = pair.symbol.split('-')
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
  const WalletAPI = useWalletAPI()

  const removeLiquidity = useCallback(() => {
    const account = WalletAPI.getWallet().get(0) as WhaleWalletAccount
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
    <View style={tailwind('w-full h-full')}>
      <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
        <View style={tailwind('w-full bg-white mt-8')}>
          <View style={tailwind('w-full flex-row p-4')}>
            <Text style={tailwind('flex-1')}>Amount of liquidity to remove</Text>
            <Text style={tailwind('text-right')}>{percentage} %</Text>
          </View>
          <AmountSlider
            current={Number(percentage)}
            viewStyle={tailwind('p-4')}
            onChange={setSliderPercentage}
          />
        </View>
        <View style={tailwind('w-full bg-white mt-8')}>
          <CoinAmountRow symbol={aSymbol} amount={tokenAAmount} />
          <CoinAmountRow symbol={bSymbol} amount={tokenBAmount} />
          <PriceRow lhs='Price' rhs={[`${tokenAPerLmToken.toString()} ${aSymbol}`, `${tokenBPerLmToken.toString()} ${bSymbol}`]} />
        </View>
      </ScrollView>
      <View style={tailwind('w-full h-16')}>
        <ContinueButton
          enabled={Number(percentage) !== 0}
          onPress={removeLiquidity}
        />
      </View>
    </View>
  )
}

function AmountSlider (props: { current: number, onChange: (percentage: number) => void, viewStyle: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <View style={[tailwind('flex-row items-center border-t border-gray-200'), props.viewStyle]}>
      <TouchableOpacity
        style={tailwind('mr-4')}
        onPress={() => props.onChange(0)}
      >
        <Text style={tailwind('text-gray-500 text-xs')}>None</Text>
      </TouchableOpacity>
      <Slider
        value={props.current}
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor='#ff00af'
        thumbTintColor='#ff00af'
        onValueChange={(val) => props.onChange(val)}
      />
      <TouchableOpacity
        style={tailwind('ml-4')}
        onPress={() => props.onChange(100)}
      >
        <Text style={tailwind('text-gray-500 text-xs')}>All</Text>
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
      <Text style={tailwind('flex-1 text-right text-gray-500 mr-2')}>{props.amount.toString()}</Text>
    </View>
  )
}

function PriceRow (props: { lhs: string, rhs: string[], rowStyle?: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <View style={[tailwind('bg-white p-2 border-t border-gray-200 flex-row items-start w-full'), props.rowStyle]}>
      <View style={tailwind('flex-1 ml-2')}>
        <Text style={tailwind('font-medium')}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1 mr-2')}>
        {props.rhs.map((val, idx) => (<Text key={idx} style={tailwind('font-medium text-right text-gray-500')}>{val}</Text>))}
      </View>
    </View>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  const buttonColor = props.enabled ? PrimaryColorStyle.bg : { backgroundColor: 'gray' }
  return (
    <TouchableOpacity
      disabled={!props.enabled}
      style={[tailwind('m-2 p-3 rounded flex-row justify-center'), buttonColor]}
      onPress={props.onPress}
    >
      <Text style={[tailwind('text-white font-bold')]}>Continue</Text>
    </TouchableOpacity>
  )
}

async function constructSignedRemoveLiqAndSend (whaleAPI: WhaleApiClient, account: WhaleWalletAccount, tokenId: number, amount: BigNumber): Promise<string> {
  const feeRate = new WhaleFeeRateProvider(whaleAPI)
  const prevout = new WhalePrevoutProvider(account, 50)
  const builder = new P2WPKHTransactionBuilder(feeRate, prevout, {
    // @ts-expect-error
    get: (_) => account.hdNode as WalletHdNode
  })

  const script = await account.getScript()
  const removeLiq = {
    script,
    tokenId,
    amount
  }
  const dfTx = await builder.liqPool.removeLiquidity(removeLiq, script)
  const buffer = new SmartBuffer()
  new CTransactionSegWit(dfTx).toBuffer(buffer)

  return await whaleAPI.transactions.send({ hex: buffer.toString('hex') })
}
