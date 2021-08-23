import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { Text } from '../../../../../components'
import { Button } from '../../../../../components/Button'
import { getNativeIcon } from '../../../../../components/icons/assets'
import { IconLabelScreenType, InputIconLabel } from '../../../../../components/InputIconLabel'
import { NumberRow } from '../../../../../components/NumberRow'
import { NumberTextInput } from '../../../../../components/NumberTextInput'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../../components/SetAmountButton'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { usePoolPairsAPI } from '../../../../../hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../../store'
import { hasTxQueued as hasBroadcastQueued } from '../../../../../store/ocean'
import { hasTxQueued } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { DexParamList } from '../DexNavigator'
import { SlippageTolerance } from './components/SlippageTolerance'

export interface DerivedTokenState {
  id: string
  amount: string
  symbol: string
}

type Props = StackScreenProps<DexParamList, 'PoolSwapScreen'>

export function PoolSwapScreen ({ route }: Props): JSX.Element {
  const client = useWhaleApiClient()
  const pairs = usePoolPairsAPI()
  const [poolpair, setPoolPair] = useState<PoolPairData>()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const tokens = useTokensAPI()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const [tokenAForm, tokenBForm] = ['tokenA', 'tokenB']
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(Logging.error)
  }, [])

  // props derived state
  const [tokenA, setTokenA] = useState<DerivedTokenState>()
  const [tokenB, setTokenB] = useState<DerivedTokenState>()
  const [isComputing, setIsComputing] = useState<boolean>(false)
  const [slippage, setSlippage] = useState<number>(0.03)
  const [aToBPrice, setAToBPrice] = useState<BigNumber>()

  // component UI state
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })

  useEffect(() => {
    const pair = pairs.find((v) => v.data.id === route.params.poolpair.id)
    if (pair !== undefined) {
      setPoolPair(pair.data)
    }
  }, [pairs, route.params.poolpair])

  function onSubmit (): void {
    if (hasPendingJob || hasPendingBroadcastJob) return
    if (tokenA === undefined || tokenB === undefined || poolpair === undefined) {
      return
    }

    const atA = poolpair.tokenA.id === tokenA?.id ? poolpair.tokenA : poolpair.tokenB
    const atB = poolpair.tokenA.id === tokenB?.id ? poolpair.tokenA : poolpair.tokenB

    if (atA !== undefined && atB !== undefined && isValid) {
      const swap = {
        fromToken: tokenA,
        toToken: tokenB,
        fromAmount: new BigNumber((getValues()[tokenAForm])),
        toAmount: new BigNumber((getValues()[tokenBForm]))
      }
      navigation.navigate('ConfirmPoolSwapScreen', {
        tokenA,
        tokenB,
        swap,
        fee,
        pair: poolpair,
        slippage
      })
    }
  }

  function updatePoolPairPrice (tokenAId: string, poolpair: PoolPairData): void {
    const aToBPrice = tokenAId === poolpair.tokenA.id
      ? new BigNumber(poolpair.tokenB.reserve).div(poolpair.tokenA.reserve)
      : new BigNumber(poolpair.tokenA.reserve).div(poolpair.tokenB.reserve)
    setAToBPrice(aToBPrice)
  }

  const swapToken = useCallback(async (): Promise<void> => {
    if (tokenB !== undefined && tokenA !== undefined) {
      const tokenAId = tokenB.id
      setTokenA(tokenB)
      setTokenB(tokenA)
      setValue(tokenAForm, '')
      await trigger(tokenAForm)
      setValue(tokenBForm, '')
      await trigger(tokenBForm)
      if (poolpair !== undefined) {
        updatePoolPairPrice(tokenAId, poolpair)
      }
    }
  }, [tokenA, tokenB, poolpair])

  useEffect(() => {
    if (poolpair !== undefined) {
      let [tokenASymbol, tokenBSymbol] = poolpair.symbol.split('-') as [string, string]
      let [tokenAId, tokenBId] = [poolpair.tokenA.id, poolpair.tokenB.id]
      if (tokenA !== undefined) {
        [tokenASymbol, tokenAId] = [tokenA.symbol, tokenA.id]
      }
      if (tokenB !== undefined) {
        [tokenBSymbol, tokenBId] = [tokenB.symbol, tokenB.id]
      }
      const a = tokens.find((token) => token.id === tokenAId) ?? {
        id: tokenAId,
        amount: '0',
        symbol: tokenASymbol
      }
      setTokenA(a)
      const b = tokens.find((token) => token.id === tokenBId) ?? {
        id: tokenBId,
        amount: '0',
        symbol: tokenBSymbol
      }
      setTokenB(b)
      updatePoolPairPrice(tokenAId, poolpair)
    }
  }, [JSON.stringify(tokens), poolpair])

  if (tokenA === undefined || tokenB === undefined || poolpair === undefined || aToBPrice === undefined) {
    return <></>
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <TokenRow
        isDisabled={false}
        token={tokenA} control={control} controlName={tokenAForm}
        title={`${translate('screens/PoolSwapScreen', 'SWAP')} ${tokenA.symbol}`}
        onChangeFromAmount={async (amount) => {
          setIsComputing(true)
          amount = isNaN(+amount) ? '0' : amount
          setValue(tokenAForm, amount)
          await trigger(tokenAForm)
          const reserveA = getReserveAmount(tokenA.id, poolpair)
          setValue(tokenBForm, calculateEstimatedAmount(amount, reserveA, aToBPrice.toFixed(8)).toFixed(8))
          await trigger(tokenBForm)
          setIsComputing(false)
        }}
        maxAmount={tokenA.amount}
      />
      <View style={tailwind('justify-center items-center mt-6')}>
        <TouchableOpacity
          style={tailwind('border border-gray-300 rounded bg-white p-1')} onPress={swapToken}
          testID='swap_button'
        >
          <MaterialIcons name='swap-vert' size={24} style={tailwind('text-primary')} />
        </TouchableOpacity>
      </View>
      <TokenRow
        isDisabled
        token={tokenB} control={control} controlName={tokenBForm}
        title={`${translate('screens/PoolSwapScreen', 'TO')} ${tokenB.symbol}`}
        maxAmount={aToBPrice.times(getValues()[tokenAForm]).toFixed(8)}
      />
      <SlippageTolerance slippage={slippage} setSlippage={(amount) => setSlippage(amount)} />
      {
        !isComputing && (new BigNumber(getValues()[tokenAForm]).isGreaterThan(0) && new BigNumber(getValues()[tokenBForm]).isGreaterThan(0)) &&
          <SwapSummary
            poolpair={poolpair} tokenA={tokenA} tokenB={tokenB} tokenAAmount={getValues()[tokenAForm]}
            tokenBAmount={getValues()[tokenBForm]}
          />
      }
      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/PoolSwapScreen', 'CONTINUE')}
        title='CONTINUE' onPress={onSubmit} testID='button_submit'
      />
    </ScrollView>
  )
}

interface TokenForm {
  control: Control
  controlName: string
  token: DerivedTokenState
  enableMaxButton?: boolean
  maxAmount?: string
  onChangeFromAmount?: (amount: string) => void
  title: string
  isDisabled: boolean
}

function TokenRow (form: TokenForm): JSX.Element {
  const { token, control, onChangeFromAmount, title, controlName, enableMaxButton = true, isDisabled } = form
  const Icon = getNativeIcon(token.symbol)
  const rules: { required: boolean, pattern: RegExp, validate: any, max?: string } = {
    required: true,
    pattern: /^\d*\.?\d*$/,
    validate: {
      greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
    }
  }
  if (form.maxAmount !== undefined) {
    rules.max = form.maxAmount
  }
  return (
    <>
      <SectionTitle text={title} testID={`text_input_${title}`} />
      <Controller
        control={control}
        rules={rules}
        render={({ field: { onBlur, onChange, value } }) => (
          <View style={tailwind('flex-row w-full border-b border-gray-100')}>
            <NumberTextInput
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              onBlur={onBlur}
              editable={!isDisabled}
              onChange={(e) => {
                if (!isDisabled) {
                  if (onChangeFromAmount !== undefined) {
                    onChangeFromAmount(e.nativeEvent.text)
                  } else onChange(e)
                }
              }}
              value={value}
              placeholder={isDisabled ? undefined : translate('screens/PoolSwapScreen', 'Enter an amount')}
              testID={`text_input_${controlName}`}
            />
            <View style={tailwind('flex-row bg-white pr-4 items-center')}>
              <Icon />
              <InputIconLabel label={token.symbol} screenType={IconLabelScreenType.DEX} />
            </View>
          </View>
        )}
        name={controlName}
        defaultValue=''
      />
      <View style={tailwind('flex-row w-full bg-white px-4 items-center')}>
        <View style={tailwind('flex-1 flex-row py-4 flex-wrap mr-2')}>
          <Text>{translate('screens/PoolSwapScreen', 'Balance: ')}</Text>
          <NumberFormat
            value={token.amount} decimalScale={8} thousandSeparator displayType='text' suffix={` ${token.symbol}`}
            renderText={(value) => (
              <Text
                testID={`text_balance_${controlName}`}
                style={tailwind('text-gray-500')}
              >
                {value}
              </Text>
            )}
          />
        </View>
        {
          (enableMaxButton != null && onChangeFromAmount !== undefined) && (
            <>
              <SetAmountButton
                type={AmountButtonTypes.half} onPress={onChangeFromAmount}
                amount={new BigNumber(token.amount)}
              />
              <SetAmountButton
                type={AmountButtonTypes.max} onPress={onChangeFromAmount}
                amount={new BigNumber(token.amount)}
              />
            </>
          )
        }

      </View>
    </>
  )
}

interface SwapSummaryItems {
  poolpair: PoolPairData
  tokenA: DerivedTokenState
  tokenB: DerivedTokenState
  tokenAAmount: string
  tokenBAmount: string
}

function SwapSummary ({ poolpair, tokenA, tokenB, tokenAAmount }: SwapSummaryItems): JSX.Element {
  const reserveA = getReserveAmount(tokenA.id, poolpair)
  const reserveB = getReserveAmount(tokenB.id, poolpair)
  const priceA = new BigNumber(reserveA).div(reserveB).toFixed(8)
  const priceB = new BigNumber(reserveB).div(reserveA).toFixed(8)
  const estimated = calculateEstimatedAmount(tokenAAmount, reserveA, priceB).toFixed(8)
  return (
    <View style={tailwind('mt-4')}>
      <NumberRow
        lhs={translate('screens/PoolSwapScreen', 'Price')}
        rightHandElements={[{
          testID: 'price_a',
          value: priceA,
          suffix: ` ${tokenA.symbol} per ${tokenB.symbol}`
        }, {
          testID: 'price_b',
          value: priceB,
          suffix: ` ${tokenB.symbol} per ${tokenA.symbol}`
        }]}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapScreen', 'Estimated to receive')}
        rightHandElements={[
          {
            value: estimated,
            suffix: ` ${tokenB.symbol}`,
            testID: 'estimated'
          }
        ]}
      />
    </View>
  )
}

function calculateEstimatedAmount (tokenAAmount: string, reserveA: string, price: string): BigNumber {
  tokenAAmount = tokenAAmount !== undefined && tokenAAmount !== '' ? tokenAAmount : '0'
  const slippage = (new BigNumber(1).minus(new BigNumber(tokenAAmount).div(reserveA)))
  return new BigNumber(tokenAAmount).times(price).times(slippage)
}

function getReserveAmount (id: string, poolpair: PoolPairData): string {
  return id === poolpair.tokenA.id ? poolpair.tokenA.reserve : poolpair.tokenB.reserve
}
