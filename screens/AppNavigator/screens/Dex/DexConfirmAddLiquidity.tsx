import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { translate } from '../../../../translations'
import { PrimaryColorStyle } from '../../../../constants/Theme'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'ConfirmAddLiquidity'>

export interface AddLiquiditySummary extends PoolPairData {
  fee: BigNumber // stick to whatever estimation/calculation done on previous page
  percentage: BigNumber // to add
}

export function ConfirmAddLiquidityScreen (props: Props): JSX.Element {
  const {
    fee,
    percentage,
    tokenA,
    tokenB,
    symbol,
    totalLiquidity
  } = props.route.params.summary
  const [aSymbol, bSymbol] = symbol.split('-')
  const aToBRate = new BigNumber(tokenB.reserve).div(tokenA.reserve).toString()
  const bToARate = new BigNumber(tokenA.reserve).div(tokenB.reserve).toString()
  const lmTokenAmount = percentage.times(totalLiquidity).toString()

  // this component state
  const tokenAAmount = percentage.times(tokenA.reserve).toString()
  const tokenBAmount = percentage.times(tokenB.reserve).toString()

  return (
    <View style={tailwind('w-full h-full')}>
      <ScrollView style={tailwind('w-full flex-column flex-1')}>
        <TextRows lhs='Adding' rhs={[`${tokenAAmount} ${aSymbol}`, `${tokenBAmount} ${bSymbol}`]} rowStyle={tailwind('mt-4')} />
        <TextRows lhs='Fee' rhs={[`${fee.toString()} DFI`]} />
        <TextRows lhs='Price' rhs={[`${aToBRate} ${bSymbol} / ${aSymbol}`, `${bToARate} ${aSymbol} / ${bSymbol}`]} />
        <TextRows lhs='Liquidity tokens received' rhs={[`${lmTokenAmount} ${aSymbol}-${bSymbol}`]} />
        <TextRows lhs='Share of pool' rhs={[`${percentage.toString()} %`]} />
        <TextRows lhs={`Pooled ${aSymbol}`} rhs={[`${tokenA.reserve}`]} />
        <TextRows lhs={`Pooled ${bSymbol}`} rhs={[`${tokenB.reserve}`]} />
      </ScrollView>
      <View style={tailwind('w-full h-16')}>
        <ComfirmButton onPress={() => { /* TODO: build tx and submit */ }} />
      </View>
    </View>
  )
}

function TextRows (props: { lhs: string, rhs: string[], rowStyle?: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <View style={[tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full'), props.rowStyle]}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        {props.rhs.map((val, idx) => (<Text key={idx} style={tailwind('font-medium text-right text-gray-500')}>{val}</Text>))}
      </View>
    </View>
  )
}

function ComfirmButton (props: { onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      style={[tailwind('m-2 p-3 rounded flex-row justify-center'), PrimaryColorStyle.bg]}
      onPress={props.onPress}
    >
      <Text style={[tailwind('text-white font-bold')]}>{translate('screens/ConfirmLiquidity', 'CONFIRM')}</Text>
    </TouchableOpacity>
  )
}
