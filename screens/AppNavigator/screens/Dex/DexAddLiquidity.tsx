import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import tailwind from 'tailwind-rn'
import { Text, TextInput, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { PrimaryColorStyle } from '../../../../constants/Theme'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'AddLiquidity'>
type EditingAmount = 'primary' | 'secondary'

interface ExtPoolPairData extends PoolPairData {
  aSymbol: string
  bSymbol: string
  aToBRate: BigNumber
  bToARate: BigNumber
}

export function AddLiquidityScreen (props: Props): JSX.Element {
  // TODO: poll for PoolPairData periodically

  // this component state
  const [tokenAAmount, setTokenAAmount] = useState<BigNumber>(new BigNumber(0))
  const [tokenBAmount, setTokenBAmount] = useState<BigNumber>(new BigNumber(0))
  const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))

  // gather required data
  const tokens = useTokensAPI()
  const { pair: poolPairData } = props.route.params
  const [aSymbol, bSymbol] = poolPairData.symbol.split('-')
  const pair: ExtPoolPairData = {
    ...poolPairData,
    aSymbol,
    bSymbol,
    aToBRate: new BigNumber(poolPairData.tokenB.reserve).div(poolPairData.tokenA.reserve),
    bToARate: new BigNumber(poolPairData.tokenA.reserve).div(poolPairData.tokenB.reserve)
  }
  const addressTokenA = tokens.find(at => at.id === pair.tokenA.id)
  const addressTokenB = tokens.find(at => at.id === pair.tokenB.id)
  // expected behavior: address token is not listed when no token
  const balanceA = addressTokenA === undefined ? new BigNumber(0) : new BigNumber(addressTokenA.amount)
  const balanceB = addressTokenB === undefined ? new BigNumber(0) : new BigNumber(addressTokenB.amount)

  const buildSummary = useCallback((ref: EditingAmount, refAmount: BigNumber) => {
    if (ref === 'primary') {
      setTokenAAmount(refAmount)
      setTokenBAmount(refAmount.times(pair.aToBRate))
      setSharePercentage(refAmount.div(pair.tokenA.reserve))
    } else {
      setTokenBAmount(refAmount)
      setTokenAAmount(refAmount.times(pair.bToARate))
      setSharePercentage(refAmount.div(pair.tokenB.reserve))
    }
  }, [tokenAAmount, tokenBAmount])

  const canContinue = canAddLiquidity(pair, tokenAAmount, tokenBAmount, balanceA, balanceB)

  return (
    <View style={tailwind('w-full h-full')}>
      <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
        <TokenInput
          symbol={pair.aSymbol}
          balance={balanceA}
          current={tokenAAmount}
          onChange={(amount) => { buildSummary('primary', amount) }}
        />
        <TokenInput
          symbol={pair.bSymbol}
          balance={balanceB}
          current={tokenBAmount}
          onChange={(amount) => { buildSummary('secondary', amount) }}
        />
        <Summary pair={pair} sharePercentage={sharePercentage} />
      </ScrollView>
      <View style={tailwind('w-full h-16')}>
        <ContinueButton enabled={canContinue} />
      </View>
    </View>
  )
}

function TokenInput (props: { symbol: string, balance: BigNumber, current: BigNumber, onChange: (amount: BigNumber) => void }): JSX.Element {
  const renderIcon = (): JSX.Element|null => {
    const TokenIcon = getTokenIcon(props.symbol)
    return (
      <View style={tailwind('w-8 justify-center items-center')}>
        <TokenIcon />
      </View>
    )
  }

  const onMax = (): void => {
    let amountToSet = props.balance
    if (props.symbol === 'DFI') { // TODO: any better way for not hardcoding this?
      amountToSet.minus(0.001) // simple fee estimation
    }

    if (amountToSet.lt(0)) {
      amountToSet = new BigNumber(0)
    }
    props.onChange(amountToSet)
  }

  return (
    <View style={tailwind('flex-column w-full h-40 items-center mt-4')}>
      <View style={tailwind('flex-column w-full h-8 bg-white justify-center')}>
        <Text style={tailwind('m-4')}>Input</Text>
      </View>
      <View style={tailwind('flex-row w-full h-16 bg-white items-center p-4')}>
        <TextInput
          style={tailwind('flex-1 mr-4 text-gray-500')}
          value={props.current.isNaN() ? '' : props.current.toString()}
          keyboardType='numeric'
          onChange={event => props.onChange(new BigNumber(event.nativeEvent.text))}
        />
        {renderIcon()}
        <Text style={tailwind('w-12 ml-4 text-gray-500')}>{props.symbol}</Text>
      </View>
      <View style={tailwind('w-full bg-white flex-row border-t border-gray-200 h-12 items-center')}>
        <View style={tailwind('flex flex-row flex-1 ml-4')}>
          <Text>Balance: </Text>
          <Text style={tailwind('text-gray-500')}>{props.balance.toString()}</Text>
        </View>
        <TouchableOpacity
          style={tailwind('flex w-12 mr4')}
          onPress={onMax}
        >
          <Text style={[PrimaryColorStyle.text]}>MAX</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Summary (props: { pair: ExtPoolPairData, sharePercentage: BigNumber }): JSX.Element {
  const { pair, sharePercentage } = props
  const RenderRow = (lhs: string, rhs: string): JSX.Element => {
    return (
      <View style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}>
        <View style={tailwind('flex-1')}>
          <Text style={tailwind('font-medium')}>{lhs}</Text>
        </View>
        <View style={tailwind('flex-1')}>
          <Text style={tailwind('font-medium text-right text-gray-500')}>{rhs}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={tailwind('flex-column w-full items-center mt-4')}>
      <View style={tailwind('bg-white p-2 border-b border-gray-200 flex-row items-center w-full h-16')}>
        <View style={tailwind('flex-1')}>
          <Text style={tailwind('font-medium')}>Price</Text>
        </View>
        <View style={tailwind('flex-1 flex-column')}>
          <Text style={tailwind('font-medium text-right text-gray-600')}>{pair.aToBRate.toString()} {pair.aSymbol} per {pair.bSymbol}</Text>
          <Text style={tailwind('font-medium text-right text-gray-600')}>{pair.bToARate.toString()} {pair.bSymbol} per {pair.aSymbol}</Text>
        </View>
      </View>
      {RenderRow('Share of pool', sharePercentage.toString())}
      {RenderRow(`Pooled ${pair.aSymbol}`, pair.tokenA.reserve)}
      {RenderRow(`Pooled ${pair.bSymbol}`, pair.tokenB.reserve)}
    </View>
  )
}

function ContinueButton (props: { enabled: boolean }): JSX.Element {
  const buttonColor = props.enabled ? PrimaryColorStyle.bg : { backgroundColor: 'gray' }
  return (
    <TouchableOpacity
      style={[tailwind('m-2 p-3 rounded flex-row justify-center'), buttonColor]}
      onPress={() => console.log('TODO: link when work on CONFIRM ADD LIQ page')}
      disabled={!props.enabled}
    >
      <Text style={[tailwind('text-white font-bold')]}>Continue</Text>
    </TouchableOpacity>
  )
}

// TODO: display specific error
function canAddLiquidity (pair: ExtPoolPairData, tokenAAmount: BigNumber, tokenBAmount: BigNumber, balanceA: BigNumber|undefined, balanceB: BigNumber|undefined): boolean {
  if (tokenAAmount.isNaN() || tokenBAmount.isNaN()) {
    // empty string, use still input-ing
    return false
  }

  if (tokenAAmount.lte(0) || tokenBAmount.lte(0)) {
    return false
  }

  if (tokenAAmount.gt(pair.tokenA.reserve) || tokenBAmount.gt(pair.tokenB.reserve)) {
    return false
  }

  if (
    balanceA === undefined || balanceA.lt(tokenAAmount) ||
    balanceB === undefined || balanceB.lt(tokenBAmount)
  ) {
    return false
  }

  return true
}
