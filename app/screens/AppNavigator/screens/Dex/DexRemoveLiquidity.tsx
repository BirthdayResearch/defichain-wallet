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
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { DexParamList } from './DexNavigator'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import Slider from '@react-native-community/slider'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { translate } from '../../../../translations'
import { PrimaryButton } from '../../../../components/PrimaryButton'
import NumberFormat from 'react-number-format'
import { getWhaleClient } from '../../../../middlewares/api/whale'

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

  const whaleAPI = getWhaleClient()
  const WalletAPI = useWalletAPI()

  const removeLiquidity = useCallback(() => {
    const account = WalletAPI.getWallet().get(0)
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
            <Text style={tailwind('flex-1')}>{translate('screens/RemoveLiquidity', 'Amount of liquidity to remove')}</Text>
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
          <PriceRow lhs={translate('screens/AddLiquidity', 'Price')} rhs={[`${tokenAPerLmToken.toString()} ${aSymbol}`, `${tokenBPerLmToken.toString()} ${bSymbol}`]} />
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
      <TouchableOpacity onPress={() => props.onChange(0)}>
        <Text style={tailwind('text-gray-500 text-xs')}>{translate('components/slider', 'None')}</Text>
      </TouchableOpacity>
      <View style={tailwind('flex-1 ml-4 mr-4')}>
        <Slider
          value={props.current}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor='#ff00af'
          thumbTintColor='#ff00af'
          onValueChange={(val) => props.onChange(val)}
        />
      </View>
      <TouchableOpacity onPress={() => props.onChange(100)}>
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
        renderText={(value) => <Text style={tailwind('flex-1 text-right text-gray-500 mr-2')}>{value}</Text>}
      />
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
  return (
    <PrimaryButton
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
