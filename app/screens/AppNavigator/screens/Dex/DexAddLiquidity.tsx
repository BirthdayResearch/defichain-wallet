import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import NumberFormat from 'react-number-format'
import { Text, TextInput, View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { getTokenIcon } from '../../../../components/icons/tokens/_index'
import LoadingScreen from '../../../../components/LoadingScreen'
import { SectionTitle } from '../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../components/SetAmountButton'
import { useTokensAPI } from '../../../../hooks/wallet/TokensAPI'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
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
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const tokens = useTokensAPI()

  // this component UI state
  const [tokenAAmount, setTokenAAmount] = useState<string>('0')
  const [tokenBAmount, setTokenBAmount] = useState<string>('0')
  const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))
  const [canContinue, setCanContinue] = useState(false)
  // derived from props
  const [balanceA, setBalanceA] = useState(new BigNumber(0))
  const [balanceB, setBalanceB] = useState(new BigNumber(0))
  const [pair, setPair] = useState<ExtPoolPairData>()

  const buildSummary = useCallback((ref: EditingAmount, amountString: string): void => {
    const refAmount = amountString.length === 0 || isNaN(+amountString) ? new BigNumber(0) : new BigNumber(amountString)
    if (pair === undefined) return
    if (ref === 'primary') {
      setTokenAAmount(amountString)
      setTokenBAmount(refAmount.times(pair.aToBRate).toFixed(8))
      setSharePercentage(refAmount.div(pair.tokenA.reserve))
    } else {
      setTokenBAmount(amountString)
      setTokenAAmount(refAmount.times(pair.bToARate).toFixed(8))
      setSharePercentage(refAmount.div(pair.tokenB.reserve))
    }
  }, [pair])

  useEffect(() => {
    if (pair === undefined) return
    setCanContinue(canAddLiquidity(
      pair,
      new BigNumber(tokenAAmount),
      new BigNumber(tokenBAmount),
      balanceA,
      balanceB
    ))
  }, [pair, tokenAAmount, tokenBAmount, balanceA, balanceB])

  // prop/global state change
  useEffect(() => {
    const { pair: poolPairData } = props.route.params
    const [aSymbol, bSymbol] = poolPairData.symbol.split('-')
    const addressTokenA = tokens.find(at => at.id === poolPairData.tokenA.id)
    const addressTokenB = tokens.find(at => at.id === poolPairData.tokenB.id)

    // side effect to state
    setPair({
      ...poolPairData,
      aSymbol,
      bSymbol,
      aToBRate: new BigNumber(poolPairData.tokenB.reserve).div(poolPairData.tokenA.reserve),
      bToARate: new BigNumber(poolPairData.tokenA.reserve).div(poolPairData.tokenB.reserve)
    })
    if (addressTokenA !== undefined) setBalanceA(new BigNumber(addressTokenA.amount))
    if (addressTokenB !== undefined) setBalanceB(new BigNumber(addressTokenB.amount))
  }, [props.route.params.pair, JSON.stringify(tokens)])

  if (pair === undefined) {
    return <LoadingScreen />
  }

  return (
    <ScrollView style={tailwind('w-full flex-col flex-1 bg-gray-100')}>
      <TokenInput
        type='primary'
        symbol={pair.aSymbol}
        balance={balanceA}
        current={tokenAAmount}
        onChange={(amount) => {
          buildSummary('primary', amount)
        }}
      />
      <TokenInput
        type='secondary'
        symbol={pair.bSymbol}
        balance={balanceB}
        current={tokenBAmount}
        onChange={(amount) => {
          buildSummary('secondary', amount)
        }}
      />
      <Summary pair={pair} sharePercentage={sharePercentage} />
      <ContinueButton
        enabled={canContinue}
        onPress={() => {
          navigation.navigate('ConfirmAddLiquidity', {
            summary: {
              ...pair,
              fee: new BigNumber(0.0001),
              tokenAAmount: new BigNumber(tokenAAmount),
              tokenBAmount: new BigNumber(tokenBAmount),
              percentage: sharePercentage
            }
          })
        }}
      />
    </ScrollView>
  )
}

// TODO(@ivan-zynesis): Refactor to reusable component after design team standardize component lib
function TokenInput (props: { symbol: string, balance: BigNumber, current: string, type: EditingAmount, onChange: (amount: string) => void }): JSX.Element {
  const TokenIcon = getTokenIcon(props.symbol)
  return (
    <View>
      <SectionTitle
        text={translate('screens/AddLiquidity', `TOKEN ${props.type === 'primary' ? 'A' : 'B'}`)}
        testID={`token_input_${props.type}_title`}
      />
      <View style={tailwind('flex-col w-full bg-white items-center')}>
        <View style={tailwind('w-full flex-row items-center')}>
          <TextInput
            testID={`token_input_${props.type}`}
            style={tailwind('flex-1 mr-4 text-gray-500 p-4')}
            value={props.current}
            keyboardType='numeric'
            onChangeText={txt => props.onChange(txt)}
          />
          <View style={tailwind('justify-center flex-row items-center pr-4')}>
            <TokenIcon />
            <Text style={tailwind('ml-2 text-gray-500 text-right')}>{props.symbol}</Text>
          </View>
        </View>
        <View style={tailwind('w-full px-4 py-2 flex-row border-t border-gray-200 items-center')}>
          <View style={tailwind('flex-row flex-1')}>
            <Text>{translate('screens/AddLiquidity', 'Balance')}: </Text>
            <NumberFormat
              value={props.balance.toNumber()} decimalScale={3} thousandSeparator displayType='text'
              suffix={` ${props.symbol}`}
              renderText={(value) => (
                <Text testID={`token_balance_${props.type}`} style={tailwind('text-gray-500')}>
                  {value}
                </Text>
              )}
            />
          </View>
          <SetAmountButton
            type={AmountButtonTypes.half}
            onPress={props.onChange}
            amount={props.balance}
          />
          <SetAmountButton
            type={AmountButtonTypes.max}
            onPress={props.onChange}
            amount={props.balance}
          />
        </View>
      </View>
    </View>
  )
}

function Summary (props: { pair: ExtPoolPairData, sharePercentage: BigNumber }): JSX.Element {
  const { pair, sharePercentage } = props
  const RenderRow = (rowProps: { lhs: string, rhs: string | number, testID: string, isPercent?: boolean }): JSX.Element => {
    return (
      <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-center w-full')}>
        <View style={tailwind('flex-1')}>
          <Text style={tailwind('font-medium')}>{rowProps.lhs}</Text>
        </View>
        <View style={tailwind('flex-1')}>
          <NumberFormat
            suffix={rowProps.isPercent === true ? '%' : ''}
            value={rowProps.rhs} decimalScale={2} thousandSeparator displayType='text'
            renderText={(value) => (
              <Text
                testID={rowProps.testID}
                style={tailwind('font-medium text-right text-gray-500')}
              >
                {value}
              </Text>
            )}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={tailwind('flex-col w-full items-center mt-4')}>
      <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-center w-full')}>
        <View style={tailwind('flex-1')}>
          <Text style={tailwind('font-medium')}>{translate('screens/AddLiquidity', 'Price')}</Text>
        </View>
        <View style={tailwind('flex-col')}>
          <View style={tailwind('flex-1 flex-row')}>
            <NumberFormat
              value={pair.aToBRate.toNumber()} decimalScale={3} thousandSeparator displayType='text'
              renderText={(value) => (
                <Text
                  testID='a_per_b_price'
                  style={tailwind('font-medium text-gray-500')}
                >
                  {value}
                </Text>
              )}
            />
            <Text
              testID='a_per_b_unit'
              style={tailwind('font-medium text-gray-500')}
            > {pair.aSymbol} {translate('screens/AddLiquidity', 'per')} {pair.bSymbol}
            </Text>
          </View>
          <View style={tailwind('flex-1 flex-row')}>
            <NumberFormat
              value={pair.bToARate.toNumber()} decimalScale={3} thousandSeparator displayType='text'
              renderText={(value) => (
                <Text
                  testID='b_per_a_price'
                  style={tailwind('font-medium text-gray-500')}
                >
                  {value}
                </Text>
              )}
            />
            <Text
              testID='b_per_a_unit'
              style={tailwind('font-medium text-gray-500')}
            > {pair.bSymbol} {translate('screens/AddLiquidity', 'per')} {pair.aSymbol}
            </Text>
          </View>
        </View>
      </View>
      <RenderRow
        testID='share_of_pool' isPercent lhs={translate('screens/AddLiquidity', 'Share of pool')}
        rhs={sharePercentage.times(100).toNumber()}
      />
      <RenderRow
        testID={`pooled_${pair.aSymbol}`}
        lhs={`${translate('screens/AddLiquidity', 'Pooled')} ${pair.aSymbol}`} rhs={pair.tokenA.reserve}
      />
      <RenderRow
        testID={`pooled_${pair.bSymbol}`}
        lhs={`${translate('screens/AddLiquidity', 'Pooled')} ${pair.bSymbol}`} rhs={pair.tokenB.reserve}
      />
    </View>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind('m-3')}>
      <Button
        testID='button_continue_add_liq'
        title='Continue'
        disabled={!props.enabled}
        onPress={props.onPress}
        label={translate('screens/SendScreen', 'CONTINUE')}
      />
    </View>
  )
}

// just leave it as it is now, will be moved to network drawer
function canAddLiquidity (pair: ExtPoolPairData, tokenAAmount: BigNumber, tokenBAmount: BigNumber, balanceA: BigNumber | undefined, balanceB: BigNumber | undefined): boolean {
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

  return !(balanceA === undefined || balanceA.lt(tokenAAmount) ||
    balanceB === undefined || balanceB.lt(tokenBAmount))
}
