import { Logging } from '@api'
import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import { NumberRow } from '@components/NumberRow'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
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
import { useSelector } from 'react-redux'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { DexParamList } from '../DexNavigator'
import { SlippageTolerance } from './components/SlippageTolerance'
import { WalletTextInput } from '@components/WalletTextInput'
import { InputHelperText } from '@components/InputHelperText'

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
  const ScreenTitle = (props: {tokenA: DerivedTokenState, tokenB: DerivedTokenState}): JSX.Element => {
    const TokenAIcon = getNativeIcon(props.tokenA.displaySymbol)
    const TokenBIcon = getNativeIcon(props.tokenB.displaySymbol)

    return (
      <ThemedView
        light={tailwind('bg-transparent')}
        dark={tailwind('bg-transparent')}
        style={tailwind('flex-row items-center pb-4')}
      >
        <ThemedSectionTitle
          testID='text_input_swap'
          text={translate('screens/PoolSwapScreen', 'Swap')}
          light={tailwind('text-gray-900')}
          dark={tailwind('text-gray-50')}
          style={tailwind('text-xl font-semibold pr-2')}
        />
        <TokenAIcon height={24} width={24} />
        <ThemedIcon iconType='MaterialIcons' name='arrow-right-alt' size={24} style={tailwind('px-1')} />
        <TokenBIcon height={24} width={24} />
      </ThemedView>
    )
  }

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
    const priceRateA = getPriceRate(getReserveAmount(tokenA.id, poolpair), getReserveAmount(tokenB.id, poolpair))
    const priceRateB = getPriceRate(getReserveAmount(tokenB.id, poolpair), getReserveAmount(tokenA.id, poolpair))

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
        slippage,
        priceRateA,
        priceRateB
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
      <View style={tailwind('px-4 pb-0 pt-7')}>
        <ScreenTitle tokenA={tokenA} tokenB={tokenB} />
        <TokenRow
          control={control}
          controlName={tokenAForm}
          isDisabled={false}
          title={translate('screens/PoolSwapScreen', 'How much {{token}} do you want to swap?', { token: tokenA.displaySymbol })}
          maxAmount={tokenA.amount}
          enableMaxButton
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
          token={tokenA}
        />
        <InputHelperText
          testID={`text_balance_${tokenAForm}`}
          label={`${translate('screens/PoolSwapScreen', 'Available')}: `}
          content={tokenA.amount}
          suffix={` ${tokenA.displaySymbol}`}
        />
      </View>
      <View style={tailwind('justify-center items-center py-2 px-4')}>
        <ThemedView
          light={tailwind('border-gray-200')}
          dark={tailwind('border-gray-700')}
          style={tailwind('border-b w-full relative top-2/4')}
        />
        <IconButton
          iconName='swap-vert'
          iconSize={24}
          iconType='MaterialIcons'
          onPress={swapToken}
          testID='swap_button'
        />
      </View>

      <View style={tailwind('p-4 pb-0')}>
        <TokenRow
          control={control}
          controlName={tokenBForm}
          isDisabled
          title={translate('screens/PoolSwapScreen', 'After')}
          token={tokenB}
          enableMaxButton={false}
        />
        <InputHelperText
          testID={`text_balance_${tokenBForm}`}
          label={`${translate('screens/PoolSwapScreen', 'You have')} `}
          content={tokenB.amount}
          suffix={` ${tokenB.displaySymbol}`}
        />
      </View>
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
            fee={fee.toFixed(8)}
          />
      }

      <Button
        disabled={!isValid || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/PoolSwapScreen', 'CONTINUE')}
        onPress={onSubmit}
        testID='button_submit'
        title='CONTINUE'
      />

      <ThemedText
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('mb-8 text-center text-sm')}
      >
        {translate('screens/PoolSwapScreen', 'Review full transaction details in the next screen')}
      </ThemedText>
    </ThemedScrollView>
  )
}

interface TokenForm {
  control: Control
  controlName: string
  token: DerivedTokenState
  enableMaxButton: boolean
  maxAmount?: string
  onChangeFromAmount?: (amount: string) => void
  title: string
  isDisabled: boolean
}

function TokenRow (form: TokenForm): JSX.Element {
  const {
    token,
    control,
    onChangeFromAmount,
    title,
    controlName,
    enableMaxButton,
    isDisabled
  } = form
  const Icon = getNativeIcon(token.displaySymbol)
  const rules: { required: boolean, pattern: RegExp, validate: any, max?: string } = {
    required: true,
    pattern: /^\d*\.?\d*$/,
    validate: {
      greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
    }
  }
  const defaultValue = ''
  if (form.maxAmount !== undefined) {
    rules.max = form.maxAmount
  }

  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name={controlName}
      render={({ field: { onChange, value } }) => (
        <ThemedView
          dark={tailwind('bg-transparent')}
          light={tailwind('bg-transparent')}
          style={tailwind('flex-row w-full')}
        >
          <WalletTextInput
            autoCapitalize='none'
            editable={!isDisabled}
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
            style={tailwind('flex-grow w-2/5')}
            testID={`text_input_${controlName}`}
            value={value}
            displayClearButton={(value !== defaultValue) && !isDisabled}
            onClearButtonPress={() => onChangeFromAmount?.(defaultValue)}
            title={title}
            inputType='numeric'
          >
            {
              (enableMaxButton && onChangeFromAmount !== undefined) && (
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
            {
              !enableMaxButton && (
                <>
                  <Icon />
                  <ThemedText style={tailwind('pl-2')}>
                    {token.displaySymbol}
                  </ThemedText>
                </>
              )
            }
          </WalletTextInput>
        </ThemedView>
      )}
      rules={rules}
    />
  )
}

interface SwapSummaryItems {
  poolpair: PoolPairData
  tokenA: DerivedTokenState
  tokenB: DerivedTokenState
  tokenAAmount: string
  tokenBAmount: string
  fee: string
}

function SwapSummary ({ poolpair, tokenA, tokenB, tokenAAmount, fee }: SwapSummaryItems): JSX.Element {
  const reserveA = getReserveAmount(tokenA.id, poolpair)
  const reserveB = getReserveAmount(tokenB.id, poolpair)
  const priceA = getPriceRate(reserveA, reserveB)
  const priceB = getPriceRate(reserveB, reserveA)
  const estimated = calculateEstimatedAmount(tokenAAmount, reserveA, priceB).toFixed(8)

  return (
    <View style={tailwind('mt-4')}>
      <ThemedSectionTitle
        testID='title_add_detail'
        text={translate('screens/PoolSwapScreen', 'TRANSACTION DETAILS')}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapScreen', '{{tokenA}} price per {{tokenB}}', { tokenA: tokenA.displaySymbol, tokenB: tokenB.displaySymbol })}
        rhs={{
          testID: 'price_a',
          value: priceA,
          suffixType: 'text',
          suffix: tokenA.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapScreen', '{{tokenA}} price per {{tokenB}}', { tokenA: tokenB.displaySymbol, tokenB: tokenA.displaySymbol })}
        rhs={{
          testID: 'price_b',
          value: priceB,
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapScreen', 'Estimated to receive')}
        rhs={{
          value: estimated,
          testID: 'estimated',
          suffixType: 'text',
          suffix: tokenB.displaySymbol
        }}
      />
      <NumberRow
        lhs={translate('screens/PoolSwapScreen', 'Estimated fee')}
        rhs={{
          value: fee,
          testID: 'estimated_fee',
          suffixType: 'text',
          suffix: 'DFI (UTXO)'
        }}
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

function getPriceRate (reserveA: string, reserveB: string): string {
  return new BigNumber(reserveA).div(reserveB).toFixed(8)
}
