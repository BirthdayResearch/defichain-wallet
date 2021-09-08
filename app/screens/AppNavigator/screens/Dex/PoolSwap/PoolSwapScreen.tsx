import { Logging } from '@api'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import { IconLabelScreenType, InputIconLabel } from '@components/InputIconLabel'
import { NumberRow } from '@components/NumberRow'
import { NumberTextInput } from '@components/NumberTextInput'
import { SectionTitle } from '@components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { ThemedScrollView, ThemedText, ThemedView } from '@components/themed'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { usePoolPairsAPI } from '@hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { hasTxQueued } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { hasTxQueued as hasBroadcastQueued } from '../../../../../store/ocean'
import { DexParamList } from '../DexNavigator'
import { SlippageTolerance } from './components/SlippageTolerance'

export interface DerivedTokenState {
  id: string
  amount: string
  symbol: string
  displaySymbol: string
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
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
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

  const swapToken = async (): Promise<void> => {
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
  }

  useEffect(() => {
    if (poolpair !== undefined) {
      let [tokenASymbol, tokenBSymbol] = poolpair.symbol.split('-') as [string, string]
      let [tokenAId, tokenBId] = [poolpair.tokenA.id, poolpair.tokenB.id]
      let [tokenADisplaySymbol, tokenBDisplaySymbol] = [poolpair.tokenA.displaySymbol, poolpair.tokenB.displaySymbol]
      if (tokenA !== undefined) {
        [tokenASymbol, tokenAId, tokenADisplaySymbol] = [tokenA.symbol, tokenA.id, tokenA.displaySymbol]
      }
      if (tokenB !== undefined) {
        [tokenBSymbol, tokenBId, tokenBDisplaySymbol] = [tokenB.symbol, tokenB.id, tokenB.displaySymbol]
      }
      const a = tokens.find((token) => token.id === tokenAId) ?? {
        id: tokenAId,
        amount: '0',
        symbol: tokenASymbol,
        displaySymbol: tokenADisplaySymbol
      }
      setTokenA(a)
      const b = tokens.find((token) => token.id === tokenBId) ?? {
        id: tokenBId,
        amount: '0',
        symbol: tokenBSymbol,
        displaySymbol: tokenBDisplaySymbol
      }
      setTokenB(b)
      updatePoolPairPrice(tokenAId, poolpair)
    }
  }, [JSON.stringify(tokens), poolpair])

  if (tokenA === undefined || tokenB === undefined || poolpair === undefined || aToBPrice === undefined) {
    return <></>
  }

  return (
    <ThemedScrollView>
      <TokenRow
        control={control}
        controlName={tokenAForm}
        isDisabled={false}
        maxAmount={tokenA.amount}
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
        title={`${translate('screens/PoolSwapScreen', 'SWAP')} ${tokenA.displaySymbol}`}
        token={tokenA}
      />

      <View style={tailwind('justify-center items-center mt-6')}>
        <IconButton
          iconName='swap-vert'
          iconSize={24}
          iconType='MaterialIcons'
          onPress={swapToken}
          testID='swap_button'
        />
      </View>

      <TokenRow
        control={control}
        controlName={tokenBForm}
        isDisabled
        maxAmount={aToBPrice.times(getValues()[tokenAForm]).toFixed(8)}
        title={`${translate('screens/PoolSwapScreen', 'TO')} ${tokenB.displaySymbol}`}
        token={tokenB}
      />

      <SlippageTolerance
        setSlippage={(amount) => setSlippage(amount)}
        slippage={slippage}
      />

      {
        !isComputing && (new BigNumber(getValues()[tokenAForm]).isGreaterThan(0) && new BigNumber(getValues()[tokenBForm]).isGreaterThan(0)) &&
          <SwapSummary
            poolpair={poolpair}
            tokenA={tokenA}
            tokenAAmount={getValues()[tokenAForm]}
            tokenB={tokenB}
            tokenBAmount={getValues()[tokenBForm]}
          />
      }

      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/PoolSwapScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='button_submit'
        title='CONTINUE'
      />
    </ThemedScrollView>
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
  const Icon = getNativeIcon(token.displaySymbol)
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
      <SectionTitle
        testID={`text_input_${title}`}
        text={title}
      />

      <Controller
        control={control}
        defaultValue=''
        name={controlName}
        render={({ field: { onBlur, onChange, value } }) => (
          <ThemedView
            dark={tailwind('bg-blue-800 border-b border-blue-900')}
            light={tailwind('bg-white border-b border-gray-200')}
            style={tailwind('flex-row w-full')}
          >
            <NumberTextInput
              autoCapitalize='none'
              editable={!isDisabled}
              onBlur={onBlur}
              onChange={(e) => {
                if (!isDisabled) {
                  if (onChangeFromAmount !== undefined) {
                    onChangeFromAmount(e.nativeEvent.text)
                  } else {
                    onChange(e)
                  }
                }
              }}
              placeholder={isDisabled ? undefined : translate('screens/PoolSwapScreen', 'Enter an amount')}
              style={tailwind('flex-grow p-4')}
              testID={`text_input_${controlName}`}
              value={value}
            />

            <ThemedView
              dark={tailwind('bg-blue-800')}
              light={tailwind('bg-white')}
              style={tailwind('flex-row pr-4 items-center')}
            >
              <Icon />

              <InputIconLabel
                label={token.displaySymbol}
                screenType={IconLabelScreenType.DEX}
              />
            </ThemedView>
          </ThemedView>
        )}
        rules={rules}
      />

      <ThemedView
        dark={tailwind('bg-blue-800 border-b border-blue-900')}
        light={tailwind('bg-white border-b border-gray-200')}
        style={tailwind('flex-row w-full bg-white px-4 items-center')}
      >
        <View style={tailwind('flex-1 flex-row py-4 flex-wrap mr-2')}>
          <ThemedText>
            {translate('screens/PoolSwapScreen', 'Balance: ')}
          </ThemedText>

          <NumberFormat
            decimalScale={8}
            displayType='text'
            renderText={(value) => (
              <ThemedText
                dark={tailwind('text-gray-300')}
                light={tailwind('text-gray-500')}
                testID={`text_balance_${controlName}`}
              >
                {value}
              </ThemedText>
            )}
            suffix={` ${token.displaySymbol}`}
            thousandSeparator
            value={token.amount}
          />
        </View>

        {
          (enableMaxButton != null && onChangeFromAmount !== undefined) && (
            <>
              <SetAmountButton
                amount={new BigNumber(token.amount)}
                onPress={onChangeFromAmount}
                type={AmountButtonTypes.half}
              />

              <SetAmountButton
                amount={new BigNumber(token.amount)}
                onPress={onChangeFromAmount}
                type={AmountButtonTypes.max}
              />
            </>
          )
        }

      </ThemedView>
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
          suffix: ` ${tokenA.displaySymbol} per ${tokenB.displaySymbol}`
        }, {
          testID: 'price_b',
          value: priceB,
          suffix: ` ${tokenB.displaySymbol} per ${tokenA.displaySymbol}`
        }]}
      />

      <NumberRow
        lhs={translate('screens/PoolSwapScreen', 'Estimated to receive')}
        rightHandElements={[
          {
            value: estimated,
            suffix: ` ${tokenB.displaySymbol}`,
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
