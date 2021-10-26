import { Button } from '@components/Button'
import { IconButton } from '@components/IconButton'
import { getNativeIcon } from '@components/icons/assets'
import { NumberRow } from '@components/NumberRow'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { ThemedIcon, ThemedScrollView, ThemedSectionTitle, ThemedText, ThemedView } from '@components/themed'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { usePoolPairsAPI } from '@hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { RootState } from '@store'
import { hasTxQueued, transactionQueue } from '@store/transaction_queue'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { DexParamList } from '../DexNavigator'
import { SlippageTolerance } from './components/SlippageTolerance'
import { WalletTextInput } from '@components/WalletTextInput'
import { InputHelperText } from '@components/InputHelperText'
import { DFITokenSelector, DFIUtxoSelector, WalletToken } from '@store/wallet'
import { EstimatedFeeInfo } from '@components/EstimatedFeeInfo'
import { NativeLoggingProps, useLogger } from '@shared-contexts/NativeLoggingProvider'
import { ConversionInfoText } from '@components/ConversionInfoText'
import { ConversionMode, dfiConversionCrafter } from '@api/transaction/dfi_converter'
import { ReservedDFIInfoText } from '@components/ReservedDFIInfoText'
import { useConversion } from '@hooks/wallet/Conversion'

export interface DerivedTokenState {
  id: string
  amount: string
  symbol: string
  displaySymbol: string
}

type Props = StackScreenProps<DexParamList, 'PoolSwapScreen'>

export function PoolSwapScreen ({ route }: Props): JSX.Element {
  const logger = useLogger()
  const client = useWhaleApiClient()
  const pairs = usePoolPairsAPI()
  const [poolpair, setPoolPair] = useState<PoolPairData>()
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const tokens = useTokensAPI()
  const dispatch = useDispatch()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const [tokenAForm, tokenBForm] = ['tokenA', 'tokenB']
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const DFIToken = useSelector((state: RootState) => DFITokenSelector(state.wallet))
  const DFIUtxo = useSelector((state: RootState) => DFIUtxoSelector(state.wallet))
  const reservedDfi = 0.1

  useEffect(() => {
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  // props derived state
  const [tokenA, setTokenA] = useState<DerivedTokenState>()
  const [tokenB, setTokenB] = useState<DerivedTokenState>()
  const [isComputing, setIsComputing] = useState<boolean>(false)
  const [slippage, setSlippage] = useState<number>(0.03)
  const [aToBPrice, setAToBPrice] = useState<BigNumber>()

  // component UI state
  const { control, setValue, formState, getValues, trigger } = useForm({ mode: 'onChange' })
  const { isConversionRequired, conversionAmount } = useConversion({
    inputToken: {
      type: tokenA?.id === '0_unified' ? 'token' : 'others',
      amount: new BigNumber(getValues(tokenAForm))
    },
    deps: [getValues(tokenAForm), JSON.stringify(tokens)]
  })
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
    const pair = pairs.find((v) => v.data.id === route.params.pair.id)
    if (pair !== undefined) {
      setPoolPair(pair.data)
    }
  }, [pairs, route.params.pair])

  async function onSubmit (): Promise<void> {
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

    if (atA === undefined || atB === undefined || !formState.isValid) {
      return
    }

    const swap = {
      fromToken: tokenA,
      toToken: tokenB,
      fromAmount: new BigNumber((getValues()[tokenAForm])),
      toAmount: new BigNumber((getValues()[tokenBForm]))
    }

    if (isConversionRequired) {
      await constructSignedConversionAndPoolswap({
        mode: 'utxosToAccount',
        amount: conversionAmount
      }, dispatch, () => {
        navigation.navigate('ConfirmPoolSwapScreen', {
          tokenA,
          tokenB,
          swap,
          fee,
          pair: poolpair,
          slippage,
          priceRateA,
          priceRateB,
          conversion: {
            isConversionRequired,
            DFIToken,
            DFIUtxo,
            conversionAmount
          }
        })
      }, logger)
    } else {
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

  const getAddressTokenById = (poolpairTokenId: string): WalletToken | undefined => {
    return tokens.find(token => {
      if (poolpairTokenId === '0' || poolpairTokenId === '0_utxo') {
        return token.id === '0_unified'
      }
      return token.id === poolpairTokenId
    })
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
      const a = getAddressTokenById(tokenAId) ?? {
        id: tokenAId,
        amount: '0',
        symbol: tokenASymbol,
        displaySymbol: tokenADisplaySymbol
      }
      setTokenA(a)
      const b = getAddressTokenById(tokenBId) ?? {
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
          maxAmount={tokenA.id === '0_unified' ? new BigNumber(tokenA.amount).minus(reservedDfi).toFixed(8) : tokenA.amount}
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
          content={tokenA.id === '0_unified' ? new BigNumber(tokenA.amount).minus(reservedDfi).toFixed(8) : tokenA.amount}
          suffix={` ${tokenA.displaySymbol}`}
        />
        {tokenA.id === '0_unified' && <ReservedDFIInfoText />}
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
          title={translate('screens/PoolSwapScreen', 'You will receive')}
          token={tokenB}
          enableMaxButton={false}
        />
        <InputHelperText
          testID={`text_balance_${tokenBForm}`}
          label={`${translate('screens/PoolSwapScreen', 'You have')} `}
          content={tokenB.amount}
          suffix={` ${tokenB.displaySymbol}`}
        />
        {isConversionRequired && <ConversionInfoText />}
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
            isConversionRequired={isConversionRequired}
            conversionAmount={conversionAmount}
          />
      }

      <ThemedText
        testID='transaction_details_hint_text'
        light={tailwind('text-gray-600')}
        dark={tailwind('text-gray-300')}
        style={tailwind('pt-2 pb-8 px-4 text-sm')}
      >
        {isConversionRequired
          ? translate('screens/PoolSwapScreen', 'Authorize transaction in the next screen to convert')
          : translate('screens/PoolSwapScreen', 'Review full transaction details in the next screen')}
      </ThemedText>

      <Button
        disabled={!formState.isValid || hasPendingJob || hasPendingBroadcastJob}
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
    isDisabled,
    maxAmount
  } = form
  const Icon = getNativeIcon(token.displaySymbol)
  const rules: { required: boolean, pattern: RegExp, validate: any, max?: string } = {
    required: true,
    max: maxAmount,
    pattern: /^\d*\.?\d*$/,
    validate: {
      greaterThanZero: (value: string) => new BigNumber(value !== undefined && value !== '' ? value : 0).isGreaterThan(0)
    }
  }
  const defaultValue = ''

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
                    amount={new BigNumber(maxAmount ?? '0')}
                    onPress={onChangeFromAmount}
                    type={AmountButtonTypes.half}
                  />

                  <SetAmountButton
                    amount={new BigNumber(maxAmount ?? '0')}
                    onPress={onChangeFromAmount}
                    type={AmountButtonTypes.max}
                  />
                </>
              )
            }
            {
              !enableMaxButton && (
                <>
                  <Icon height={20} width={20} />
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
  isConversionRequired: boolean
  conversionAmount: BigNumber
}

function SwapSummary ({ poolpair, tokenA, tokenB, tokenAAmount, fee, isConversionRequired, conversionAmount }: SwapSummaryItems): JSX.Element {
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
      {isConversionRequired &&
        <NumberRow
          lhs={translate('screens/PoolSwapScreen', 'Amount to be converted')}
          rhs={{
            testID: 'amount_to_convert',
            value: conversionAmount.toFixed(8),
            suffixType: 'text',
            suffix: tokenA.displaySymbol
          }}
        />}
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
      <EstimatedFeeInfo
        lhs={translate('screens/PoolSwapScreen', 'Estimated fee')}
        rhs={{
          value: fee,
          testID: 'estimated_fee',
          suffix: 'DFI'
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

async function constructSignedConversionAndPoolswap ({
  mode,
  amount
}: { mode: ConversionMode, amount: BigNumber }, dispatch: Dispatch<any>, onBroadcast: () => void, logger: NativeLoggingProps): Promise<void> {
  try {
    dispatch(transactionQueue.actions.push(dfiConversionCrafter(amount, mode, onBroadcast, 'CONVERTING')))
  } catch (e) {
    logger.error(e)
  }
}
