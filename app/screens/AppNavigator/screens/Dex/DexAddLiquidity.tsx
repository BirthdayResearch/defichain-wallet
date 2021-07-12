// import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
// import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useState } from 'react'
import { TouchableOpacity, ScrollView, Button } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, TextInput, View } from '../../../../components'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import { PrimaryColorStyle } from '../../../../constants/Theme'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { DexParamList } from './DexNavigator'
import { translate } from '../../../../translations'
import NumberFormat from 'react-number-format'
import { PrimaryButton } from '../../../../components/PrimaryButton'
import LoadingScreen from '../../../LoadingNavigator/LoadingScreen'

type Props = StackScreenProps<DexParamList, 'AddLiquidity'>
type EditingAmount = 'primary' | 'secondary'

// interface ExtPoolPairData extends PoolPairData {
//   aSymbol: string
//   bSymbol: string
//   aToBRate: BigNumber
//   bToARate: BigNumber
// }

function Debugger (props: { step: number, onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind('flex-col w-full h-8 justify-center')}>
      <Text>{props.step}</Text>
      <Button title='next' onPress={props.onPress} />
    </View>
  )
}

export function AddLiquidityScreen (props: Props): JSX.Element {
  // const navigation = useNavigation<NavigationProp<DexParamList>>()
  const tokens = useTokensAPI()

  const [debug, setDebug] = useState(0)

  const [tokenAAmount, setTokenAAmount] = useState<string>('0')
  const [tokenBAmount, setTokenBAmount] = useState<string>('0')
  // const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))

  const { pair: poolPairData } = props.route.params
  const [aSymbol, bSymbol] = poolPairData.symbol.split('-')
  const addressTokenA = tokens.find(at => at.id === poolPairData.tokenA.id)
  const addressTokenB = tokens.find(at => at.id === poolPairData.tokenB.id)

  // side effect to state
  const pair = {
    ...poolPairData,
    aSymbol,
    bSymbol,
    aToBRate: new BigNumber(poolPairData.tokenB.reserve).div(poolPairData.tokenA.reserve),
    bToARate: new BigNumber(poolPairData.tokenA.reserve).div(poolPairData.tokenB.reserve)
  }
  // if (addressTokenA !== undefined) setBalanceA(new BigNumber(addressTokenA.amount))
  // if (addressTokenB !== undefined) setBalanceB(new BigNumber(addressTokenB.amount))
  const balanceA = addressTokenA !== undefined ? new BigNumber(addressTokenA.amount) : new BigNumber(0)
  const balanceB = addressTokenB !== undefined ? new BigNumber(addressTokenB.amount) : new BigNumber(0)

  if (debug === 0) {
    return <Debugger step={debug} onPress={() => setDebug(debug + 1)} />
  }

  // this component state
  // const [balanceA, setBalanceA] = useState(new BigNumber(0))
  // const [balanceB, setBalanceB] = useState(new BigNumber(0))
  // const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))
  // const [pair, setPair] = useState<ExtPoolPairData>()
  // const [canContinue, setCanContinue] = useState(false)

  if (debug === 1) {
    return <Debugger step={debug} onPress={() => setDebug(debug + 1)} />
  }

  const buildSummary = (ref: EditingAmount, amountString: string): void => {
    const refAmount = amountString.length === 0 ? new BigNumber(0) : new BigNumber(amountString)
    if (pair === undefined) return
    if (ref === 'primary') {
      setTokenAAmount(amountString)
      setTokenBAmount(refAmount.times(pair.aToBRate).toString())
      // setSharePercentage(refAmount.div(pair.tokenA.reserve))
    } else {
      setTokenBAmount(amountString)
      setTokenAAmount(refAmount.times(pair.bToARate).toString())
      // setSharePercentage(refAmount.div(pair.tokenB.reserve))
    }
  }

  if (debug === 2) {
    return <Debugger step={debug} onPress={() => setDebug(debug + 1)} />
  }

  // const canContinue = canAddLiquidity(
  //   pair,
  //   new BigNumber(tokenAAmount),
  //   new BigNumber(tokenBAmount),
  //   balanceA,
  //   balanceB
  // )

  // useEffect(() => {
  //   if (pair === undefined) return
  //   setCanContinue(canAddLiquidity(
  //     pair,
  //     new BigNumber(tokenAAmount),
  //     new BigNumber(tokenBAmount),
  //     balanceA,
  //     balanceB
  //   ))
  // }, [pair, tokenAAmount, tokenBAmount, balanceA, balanceB])

  if (debug === 3) {
    return <Debugger step={debug} onPress={() => setDebug(debug + 1)} />
  }

  // prop/global state change
  // useEffect(() => {
  //   const { pair: poolPairData } = props.route.params
  //   const [aSymbol, bSymbol] = poolPairData.symbol.split('-')
  //   const addressTokenA = tokens.find(at => at.id === poolPairData.tokenA.id)
  //   const addressTokenB = tokens.find(at => at.id === poolPairData.tokenB.id)

  //   // side effect to state
  //   setPair({
  //     ...poolPairData,
  //     aSymbol,
  //     bSymbol,
  //     aToBRate: new BigNumber(poolPairData.tokenB.reserve).div(poolPairData.tokenA.reserve),
  //     bToARate: new BigNumber(poolPairData.tokenA.reserve).div(poolPairData.tokenB.reserve)
  //   })
  //   if (addressTokenA !== undefined) setBalanceA(new BigNumber(addressTokenA.amount))
  //   if (addressTokenB !== undefined) setBalanceB(new BigNumber(addressTokenB.amount))
  // }, [props.route.params.pair, tokens])

  if (debug === 4) {
    return <Debugger step={debug} onPress={() => setDebug(debug + 1)} />
  }

  if (pair === undefined) {
    return <LoadingScreen />
  }

  if (debug === 5) {
    return <Debugger step={debug} onPress={() => setDebug(debug + 1)} />
  }

  return (
    <View style={tailwind('w-full h-full flex-col')}>
      <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
        <TokenInput
          type='primary'
          symbol={pair.aSymbol}
          balance={balanceA}
          current={tokenAAmount}
          onChange={(amount) => { buildSummary('primary', amount) }}
        />
        <TokenInput
          type='secondary'
          symbol={pair.bSymbol}
          balance={balanceB}
          current={tokenBAmount}
          onChange={(amount) => { buildSummary('secondary', amount) }}
        />
        {
          // debug < 6
          //   ? (<Debugger step={debug} onPress={() => setDebug(debug + 1)} />)
          //   : (<Summary pair={pair} sharePercentage={sharePercentage} />)
        }
      </ScrollView>
      {
        debug < 7
          ? (<Debugger step={debug} onPress={() => setDebug(debug + 1)} />)
          : (
            <ContinueButton
              enabled={false}
              onPress={() => {
                // navigation.navigate('ConfirmAddLiquidity', {
                //   summary: {
                //     ...pair,
                //     fee: new BigNumber(0.0001),
                //     tokenAAmount: new BigNumber(tokenAAmount),
                //     tokenBAmount: new BigNumber(tokenBAmount),
                //     percentage: sharePercentage
                //   }
                // })
              }}
            />
          )
      }
    </View>
  )
}

// TODO(@ivan-zynesis): Refactor to reusable component after design team standardize component lib
function TokenInput (props: { symbol: string, balance: BigNumber, current: string, type: EditingAmount, onChange: (amount: string) => void }): JSX.Element {
  const TokenIcon = getTokenIcon(props.symbol)
  return (
    <View style={tailwind('flex-col w-full h-36 bg-white items-center mt-4')}>
      <View style={tailwind('flex-col w-full h-8 justify-center')}>
        <Text style={tailwind('ml-4')}>{translate('screens/AddLiquidity', 'Input')}</Text>
      </View>
      <View style={tailwind('w-full flex-row h-16 items-center p-4')}>
        <TextInput
          testID={`token_input_${props.type}`}
          style={tailwind('flex-1 mr-4 text-gray-500')}
          value={props.current}
          keyboardType='numeric'
          onChangeText={txt => props.onChange(txt)}
        />
        <View style={tailwind('w-8 justify-center items-center')}>
          <TokenIcon />
        </View>
        <Text style={tailwind('ml-4 text-gray-500 text-right')}>{props.symbol}</Text>
      </View>
      <View style={tailwind('w-full flex-row border-t border-gray-200 h-12 items-center')}>
        <View style={tailwind('flex-row flex-1 ml-4')}>
          <Text>{translate('screens/AddLiquidity', 'Balance')}: </Text>
          <NumberFormat
            value={props.balance.toNumber()} decimalScale={3} thousandSeparator displayType='text'
            renderText={(value) => <Text testID={`token_balance_${props.type}`} style={tailwind('text-gray-500')}>{value}</Text>}
          />
        </View>
        <TouchableOpacity
          style={tailwind('flex mr-4')}
          onPress={() => props.onChange(props.balance.toString())}
        >
          <Text style={[PrimaryColorStyle.text]}>{translate('screens/AddLiquidity', 'MAX')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// function Summary (props: { pair: ExtPoolPairData, sharePercentage: BigNumber }): JSX.Element {
//   const { pair, sharePercentage } = props
//   const RenderRow = (props: { lhs: string, rhs: string | number }): JSX.Element => {
//     const rhsTestID = props.lhs.replaceAll(' ', '_').toLowerCase()
//     return (
//       <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-center w-full')}>
//         <View style={tailwind('flex-1')}>
//           <Text style={tailwind('font-medium')}>{props.lhs}</Text>
//         </View>
//         <View style={tailwind('flex-1')}>
//           <NumberFormat
//             value={props.rhs} decimalScale={2} thousandSeparator displayType='text'
//             renderText={(value) => <Text testID={rhsTestID} style={tailwind('font-medium text-right text-gray-500')}>{value}</Text>}
//           />
//         </View>
//       </View>
//     )
//   }

//   return (
//     <View style={tailwind('flex-col w-full items-center mt-4')}>
//       <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-center w-full')}>
//         <View style={tailwind('flex-1')}>
//           <Text style={tailwind('font-medium')}>{translate('screens/AddLiquidity', 'Price')}</Text>
//         </View>
//         <View style={tailwind('flex-col')}>
//           <View style={tailwind('flex-1 flex-row')}>
//             <NumberFormat
//               value={pair.aToBRate.toNumber()} decimalScale={3} thousandSeparator displayType='text'
//               renderText={(value) => <Text testID='a_per_b_price' style={tailwind('font-medium text-gray-500')}>{value}</Text>}
//             />
//             <Text testID='a_per_b_unit' style={tailwind('font-medium text-gray-500')}> {pair.aSymbol} {translate('screens/AddLiquidity', 'per')} {pair.bSymbol}</Text>
//           </View>
//           <View style={tailwind('flex-1 flex-row')}>
//             <NumberFormat
//               value={pair.bToARate.toNumber()} decimalScale={3} thousandSeparator displayType='text'
//               renderText={(value) => <Text testID='b_per_a_price' style={tailwind('font-medium text-gray-500')}>{value}</Text>}
//             />
//             <Text testID='b_per_a_unit' style={tailwind('font-medium text-gray-500')}> {pair.bSymbol} {translate('screens/AddLiquidity', 'per')} {pair.aSymbol}</Text>
//           </View>
//         </View>
//       </View>
//       <RenderRow lhs={translate('screens/AddLiquidity', 'Share of pool')} rhs={sharePercentage.times(100).toNumber()} />
//       <RenderRow lhs={`${translate('screens/AddLiquidity', 'Pooled ')} ${pair.aSymbol}`} rhs={pair.tokenA.reserve} />
//       <RenderRow lhs={`${translate('screens/AddLiquidity', 'Pooled ')} ${pair.bSymbol}`} rhs={pair.tokenB.reserve} />
//     </View>
//   )
// }

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  return (
    <PrimaryButton
      // touchableStyle={tailwind('m-2')}
      testID='button_continue_add_liq'
      title='Continue'
      disabled={!props.enabled}
      onPress={props.onPress}
    >
      <Text style={tailwind('text-white font-bold')}>{translate('screens/SendScreen', 'CONTINUE')}</Text>
    </PrimaryButton>
  )
}

// // TODO: display specific error
// function canAddLiquidity (pair: ExtPoolPairData, tokenAAmount: BigNumber, tokenBAmount: BigNumber, balanceA: BigNumber|undefined, balanceB: BigNumber|undefined): boolean {
//   if (tokenAAmount.isNaN() || tokenBAmount.isNaN()) {
//     // empty string, use still input-ing
//     return false
//   }

//   if (tokenAAmount.lte(0) || tokenBAmount.lte(0)) {
//     return false
//   }

//   if (tokenAAmount.gt(pair.tokenA.reserve) || tokenBAmount.gt(pair.tokenB.reserve)) {
//     return false
//   }

//   if (
//     balanceA === undefined || balanceA.lt(tokenAAmount) ||
//     balanceB === undefined || balanceB.lt(tokenBAmount)
//   ) {
//     return false
//   }

//   return true
// }
