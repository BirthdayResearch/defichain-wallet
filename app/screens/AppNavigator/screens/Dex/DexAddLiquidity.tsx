import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import NumberFormat from 'react-number-format'
import { View } from '../../../../components'
import { Button } from '../../../../components/Button'
import { getNativeIcon } from '../../../../components/icons/assets'
import { IconLabelScreenType, InputIconLabel } from '../../../../components/InputIconLabel'
import { NumberRow } from '../../../../components/NumberRow'
import { NumberTextInput } from '../../../../components/NumberTextInput'
import { AmountButtonTypes, SetAmountButton } from '../../../../components/SetAmountButton'
import { ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '../../../../components/themed'
import { usePoolPairsAPI } from '../../../../hooks/wallet/PoolPairsAPI'
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
  const pairs = usePoolPairsAPI()
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const tokens = useTokensAPI()

  // this component UI state
  const [tokenAAmount, setTokenAAmount] = useState<string>('')
  const [tokenBAmount, setTokenBAmount] = useState<string>('')
  const [sharePercentage, setSharePercentage] = useState<BigNumber>(new BigNumber(0))
  const [canContinue, setCanContinue] = useState(false)
  // derived from props
  const [balanceA, setBalanceA] = useState(new BigNumber(0))
  const [balanceB, setBalanceB] = useState(new BigNumber(0))
  const [pair, setPair] = useState<ExtPoolPairData>()

  const buildSummary = useCallback((ref: EditingAmount, amountString: string): void => {
    const refAmount = amountString.length === 0 || isNaN(+amountString) ? new BigNumber(0) : new BigNumber(amountString)
    if (pair === undefined) {
      return
    }
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
    if (pair === undefined) {
      return
    }
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
    const poolpair = pairs.find((p) => p.data.id === poolPairData.id)?.data
    if (poolpair !== undefined) {
      const [aSymbol, bSymbol] = poolpair.symbol.split('-')
      const addressTokenA = tokens.find(at => at.id === poolpair.tokenA.id)
      const addressTokenB = tokens.find(at => at.id === poolpair.tokenB.id)

      // side effect to state
      setPair({
        ...poolpair,
        aSymbol,
        bSymbol,
        aToBRate: new BigNumber(poolpair.tokenB.reserve).div(poolpair.tokenA.reserve),
        bToARate: new BigNumber(poolpair.tokenA.reserve).div(poolpair.tokenB.reserve)
      })
      if (addressTokenA !== undefined) {
        setBalanceA(new BigNumber(addressTokenA.amount))
      }
      if (addressTokenB !== undefined) {
        setBalanceB(new BigNumber(addressTokenB.amount))
      }
    }
  }, [props.route.params.pair, JSON.stringify(tokens), pairs])

  if (pair === undefined) {
    return <></>
  }

  return (
    <ThemedScrollView style={tailwind('w-full flex-col flex-1')}>
      <TokenInput
        balance={balanceA}
        current={tokenAAmount}
        onChange={(amount) => {
          buildSummary('primary', amount)
        }}
        symbol={pair?.tokenA?.displaySymbol}
        type='primary'
      />

      <TokenInput
        balance={balanceB}
        current={tokenBAmount}
        onChange={(amount) => {
          buildSummary('secondary', amount)
        }}
        symbol={pair?.tokenB?.displaySymbol}
        type='secondary'
      />

      <Summary
        pair={pair}
        sharePercentage={sharePercentage}
      />

      <ContinueButton
        enabled={canContinue}
        onPress={() => {
          navigation.navigate({
            name: 'ConfirmAddLiquidity',
            params: {
              summary: {
                ...pair,
                fee: new BigNumber(0.0001),
                tokenAAmount: new BigNumber(tokenAAmount),
                tokenBAmount: new BigNumber(tokenBAmount),
                percentage: sharePercentage
              },
              pair
            },
            merge: true
          })
        }}
      />
    </ThemedScrollView>
  )
}

function TokenInput (props: { symbol: string, balance: BigNumber, current: string, type: EditingAmount, onChange: (amount: string) => void }): JSX.Element {
  const TokenIcon = getNativeIcon(props.symbol)

  return (
    <View>
      <ThemedSectionTitle
        testID={`token_input_${props.type}_title`}
        text={translate('screens/AddLiquidity', `TOKEN ${props.type === 'primary' ? 'A' : 'B'}`)}
      />

      <ThemedView
        dark={tailwind('bg-blue-800')}
        light={tailwind('bg-white')}
        style={tailwind('flex-col w-full items-center')}
      >
        <View style={tailwind('w-full flex-row items-center')}>
          <NumberTextInput
            onChangeText={txt => props.onChange(txt)}
            placeholder={translate('screens/AddLiquidity', 'Enter an amount')}
            style={tailwind('flex-1 mr-4 p-4')}
            testID={`token_input_${props.type}`}
            value={props.current}
          />

          <View style={tailwind('justify-center flex-row items-center pr-4')}>
            <TokenIcon />

            <InputIconLabel
              label={props.symbol}
              screenType={IconLabelScreenType.DEX}
            />
          </View>
        </View>

        <ThemedView
          dark={tailwind('border-t border-blue-900')}
          light={tailwind('border-t border-gray-200')}
          style={tailwind('w-full px-4 py-2 flex-row items-center')}
        >
          <View style={tailwind('flex-row flex-1 flex-wrap mr-2')}>
            <ThemedText>
              {translate('screens/AddLiquidity', 'Balance')}
              :

              {' '}
            </ThemedText>

            <NumberFormat
              decimalScale={8}
              displayType='text'
              renderText={(value) => (
                <ThemedText
                  dark={tailwind('text-gray-300')}
                  light={tailwind('text-gray-500')}
                  testID={`token_balance_${props.type}`}
                >
                  {value}
                </ThemedText>
              )}
              suffix={` ${props.symbol}`}
              thousandSeparator
              value={props.balance.toFixed(8)}
            />
          </View>

          <SetAmountButton
            amount={props.balance}
            onPress={props.onChange}
            type={AmountButtonTypes.half}
          />

          <SetAmountButton
            amount={props.balance}
            onPress={props.onChange}
            type={AmountButtonTypes.max}
          />
        </ThemedView>
      </ThemedView>
    </View>
  )
}

function Summary (props: { pair: ExtPoolPairData, sharePercentage: BigNumber }): JSX.Element {
  const { pair, sharePercentage } = props

  return (
    <View style={tailwind('flex-col w-full items-center mt-4')}>
      <NumberRow
        lhs={translate('screens/AddLiquidity', 'Price')}
        rightHandElements={[{
          value: pair.aToBRate.toFixed(8),
          suffix: ` ${pair?.tokenB?.displaySymbol} ${translate('screens/AddLiquidity', 'per')} ${pair?.tokenA?.displaySymbol}`,
          testID: 'a_per_b_price'
        }, {
          value: pair.bToARate.toFixed(8),
          suffix: ` ${pair?.tokenA?.displaySymbol} ${translate('screens/AddLiquidity', 'per')} ${pair?.tokenB?.displaySymbol}`,
          testID: 'b_per_a_price'
        }]}
      />

      <NumberRow
        lhs={translate('screens/AddLiquidity', 'Share of pool')}
        rightHandElements={[{
          value: sharePercentage.times(100).toFixed(8),
          suffix: '%',
          testID: 'share_of_pool'
        }]}
      />

      <NumberRow
        lhs={`${translate('screens/AddLiquidity', 'Pooled')} ${pair?.tokenA?.displaySymbol}`}
        rightHandElements={[{
          value: pair.tokenA.reserve,
          suffix: '',
          testID: `pooled_${pair?.tokenA?.displaySymbol}`
        }]}
      />

      <NumberRow
        lhs={`${translate('screens/AddLiquidity', 'Pooled')} ${pair?.tokenB?.displaySymbol}`}
        rightHandElements={[{
          value: pair.tokenB.reserve,
          suffix: '',
          testID: `pooled_${pair?.tokenB?.displaySymbol}`
        }]}
      />
    </View>
  )
}

function ContinueButton (props: { enabled: boolean, onPress: () => void }): JSX.Element {
  return (
    <View style={tailwind('m-3')}>
      <Button
        disabled={!props.enabled}
        label={translate('screens/SendScreen', 'CONTINUE')}
        onPress={props.onPress}
        testID='button_continue_add_liq'
        title='Continue'
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
