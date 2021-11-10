import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import { Control, Controller, useForm } from 'react-hook-form'
import BigNumber from 'bignumber.js'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import { RootState } from '@store'
import { hasTxQueued as hasBroadcastQueued } from '@store/ocean'
import { hasTxQueued } from '@store/transaction_queue'
import { WalletToken } from '@store/wallet'
import { usePoolPairsAPI } from '@hooks/wallet/PoolPairsAPI'
import { useTokensAPI } from '@hooks/wallet/TokensAPI'
import { useLogger } from '@shared-contexts/NativeLoggingProvider'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import {
  ThemedIcon,
  ThemedScrollView,
  ThemedSectionTitle,
  ThemedText,
  ThemedTouchableOpacity, ThemedView
} from '@components/themed'
import { getNativeIcon } from '@components/icons/assets'
import { Button } from '@components/Button'
import { FeeInfoRow } from '@components/FeeInfoRow'
import { InputHelperText } from '@components/InputHelperText'
import { PriceRateProps, PricesSection } from './components/PricesSection'
import { AmountButtonTypes, SetAmountButton } from '@components/SetAmountButton'
import { TextRow } from '@components/TextRow'
import { WalletTextInput } from '@components/WalletTextInput'
import { SlippageTolerance } from '../PoolSwap/components/SlippageTolerance'
import { DexParamList } from '../DexNavigator'

export interface DerivedTokenState {
  id: string
  amount: string
  symbol: string
  displaySymbol: string
}

export function CompositeSwapScreen (): JSX.Element {
  const logger = useLogger()
  const pairs = usePoolPairsAPI()
  const tokens = useTokensAPI()
  const client = useWhaleApiClient()
  const navigation = useNavigation<NavigationProp<DexParamList>>()

  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))

  const reservedDfi = 0.1
  const [fee, setFee] = useState<BigNumber>(new BigNumber(0.0001))
  const [selectedTokenA, setSelectedTokenA] = useState<DerivedTokenState>()
  const [selectedTokenB, setSelectedTokenB] = useState<DerivedTokenState>()
  const [selectedPoolPair, setSelectedPoolPair] = useState<PoolPairData>()
  const [priceRates, setPriceRates] = useState<PriceRateProps[]>()
  const [slippage, setSlippage] = useState<number>(0.03)

  // component UI state
  const { control, setValue, trigger, watch } = useForm<{
    tokenA: string
    tokenB: string
  }>({ mode: 'onChange' })
  const { tokenA, tokenB } = watch()
  const tokenAFormAmount = tokenA === '' ? undefined : tokenA
  const tokenBFormAmount = tokenB === '' ? undefined : tokenB

  const getMaxAmount = (token: DerivedTokenState): string => {
    if (token.id !== '0_unified') {
      return new BigNumber(token.amount).toFixed(8)
    }

    const maxAmount = new BigNumber(token.amount).minus(reservedDfi)
    return maxAmount.isLessThanOrEqualTo(0) ? new BigNumber(0).toFixed(8) : maxAmount.toFixed(8)
  }

  const onTokenSelect = ({ direction, value }: {direction: 'FROM' | 'TO', value: string}): void => {
    // TODO - THIS IS TEMP. Once TokenBottomSheet is merged, this will be replaced
    const selectedPair = pairs.find(pair => pair.data.tokenA.symbol === value)?.data.tokenA ?? pairs.find(pair => pair.data.tokenB.symbol === value)?.data.tokenB

    if (selectedPair === undefined) {
      return
    }

    const mappedData: DerivedTokenState = getAddressTokenById(selectedPair.id) ?? {
      id: selectedPair.id,
      symbol: selectedPair.symbol,
      displaySymbol: selectedPair.displaySymbol,
      amount: selectedPair.reserve
    }

    direction === 'FROM' ? setSelectedTokenA(mappedData) : setSelectedTokenB(mappedData)
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
    client.fee.estimate()
      .then((f) => setFee(new BigNumber(f)))
      .catch(logger.error)
  }, [])

  useEffect(() => {
    // TODO - Handle "pairs" of composite swap
    if (selectedTokenA !== undefined && selectedTokenB !== undefined) {
      const selectedPoolPair = pairs.find(pair => (
        (pair.data.tokenA.symbol === selectedTokenA.symbol && pair.data.tokenB.symbol === selectedTokenB.symbol) ||
        (pair.data.tokenA.symbol === selectedTokenB.symbol && pair.data.tokenB.symbol === selectedTokenA.symbol)
      ))?.data

      if (selectedPoolPair != null) {
        setSelectedPoolPair(selectedPoolPair)
      }
    }
  }, [selectedTokenA, selectedTokenB])

  useEffect(() => {
    if (selectedTokenA !== undefined && selectedTokenB !== undefined && selectedPoolPair !== undefined) {
      const reserveA = getReserveAmount(selectedTokenA.id, selectedPoolPair)
      const reserveB = getReserveAmount(selectedTokenB.id, selectedPoolPair)
      const priceA = getPriceRate(reserveA, reserveB)
      const priceB = getPriceRate(reserveB, reserveA)

      // TODO - Handle price rates computation of composite swap (multiple hops)
      setPriceRates([{
        label: `${selectedPoolPair.tokenA.displaySymbol} price per ${selectedPoolPair.tokenB.displaySymbol}`,
        value: priceB
      }, {
        label: `${selectedPoolPair.tokenB.displaySymbol} price per ${selectedPoolPair.tokenA.displaySymbol}`,
        value: priceA
      }
      ])

      // TODO - Handle calculation of estimated Amount of composite swap
        const aToBPrice = selectedTokenA.id === selectedPoolPair.tokenA.id
          ? new BigNumber(selectedPoolPair.tokenB.reserve).div(selectedPoolPair.tokenA.reserve)
          : new BigNumber(selectedPoolPair.tokenA.reserve).div(selectedPoolPair.tokenB.reserve)
        const estimated = calculateEstimatedAmount(tokenAFormAmount ?? '', reserveA, aToBPrice.toFixed(8)).toFixed(8)
        setValue('tokenB', estimated)
    }
  }, [selectedPoolPair, tokenAFormAmount])

  const onSubmit = async (): Promise<void> => {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    if (selectedTokenA === undefined || selectedTokenB === undefined || priceRates === undefined || tokenAFormAmount === undefined || tokenBFormAmount === undefined) {
      return
    }

    navigation.navigate('ConfirmCompositeSwapScreen', {
      tokenA: selectedTokenA,
      tokenB: selectedTokenB,
      swap: {
        tokenTo: selectedTokenB,
        tokenFrom: selectedTokenA,
        amountFrom: new BigNumber(tokenAFormAmount),
        amountTo: new BigNumber(tokenBFormAmount)
      },
      fee,
      slippage,
      priceRates
      // TODO - Add auto conversion
      // conversion: {
      //   isConversionRequired,
      //   DFIToken,
      //   DFIUtxo,
      //   conversionAmount
      // }
    })
  }

  return (
    <ThemedScrollView>
      <ThemedText
        dark={tailwind('text-gray-50')}
        light={tailwind('text-gray-900')}
        style={tailwind('text-xl font-semibold m-4 mb-0')}
      >Swap Tokens
      </ThemedText>

      <View style={tailwind('flex flex-row mt-3 mx-2')}>
        <TokenSelection label='FROM' symbol={selectedTokenA?.displaySymbol} onPress={() => onTokenSelect({ direction: 'FROM', value: 'DFI' })} />
        <TokenSelection label='TO' symbol={selectedTokenB?.displaySymbol} onPress={() => onTokenSelect({ direction: 'TO', value: 'USDT' })} />
      </View>

      {(selectedTokenA === undefined || selectedTokenB === undefined) &&
        <ThemedText
          dark={tailwind('text-gray-400')}
          light={tailwind('text-gray-500')}
          style={tailwind('mt-10 text-center')}
        >Select tokens you want to swap to get started
        </ThemedText>}

      {selectedTokenA !== undefined && selectedTokenB !== undefined &&
        <View style={tailwind('mt-10 mx-4')}>
          <TokenRow
            control={control}
            controlName='tokenA'
            isDisabled={false}
            title={translate('screens/CompositePoolSwapScreen', 'How much {{token}} do you want to swap?', { token: selectedTokenA.displaySymbol })}
            maxAmount={getMaxAmount(selectedTokenA)}
            enableMaxButton
            onChangeFromAmount={async (amount) => {
              amount = isNaN(+amount) ? '0' : amount
              setValue('tokenA', amount)
              await trigger('tokenA')
            }}
            token={selectedTokenA}
          />
          <InputHelperText
            testID='text_balance_amount'
            label={`${translate('screens/CompositePoolSwapScreen', 'You have')} `}
            content={getMaxAmount(selectedTokenA)} suffix={` ${selectedTokenA.displaySymbol}`}
          />
          <View style={tailwind('mt-4')}>
            <TokenRow
              control={control}
              controlName='tokenB'
              isDisabled
              title={translate('screens/CompositePoolSwapScreen', 'Estimated to receive')}
              token={selectedTokenB}
              enableMaxButton={false}
            />
          </View>
          <SlippageTolerance setSlippage={(amount) => setSlippage(amount)} slippage={slippage} />
        </View>}

      {(selectedTokenB !== undefined && priceRates !== undefined && tokenAFormAmount !== undefined && tokenBFormAmount !== undefined) &&
        <>
          <PricesSection priceRates={priceRates} sectionTitle='PRICES' />
          <TransactionDetailsSection estimatedAmount={tokenBFormAmount} fee={fee} tokenB={selectedTokenB} />
        </>}

      {selectedTokenA !== undefined && selectedTokenB !== undefined && (
        <Button
          disabled={tokenBFormAmount === undefined}
          label={translate('screens/CompositePoolSwapScreen', 'CONTINUE')}
          onPress={onSubmit}
          testID='button_submit'
          title='CONTINUE'
        />)}
    </ThemedScrollView>
)
}

function TokenSelection (props: {symbol?: string, label: string, onPress: () => void}): JSX.Element {
  const Icon = getNativeIcon(props.symbol ?? '')

  return (
    <View style={[tailwind('flex-grow mx-2'), { flexBasis: 0 }]}>
      <ThemedText
        dark={tailwind('text-gray-400')}
        light={tailwind('text-gray-500')}
        style={tailwind('text-xs pb-1')}
      >{props.label}
      </ThemedText>
      <ThemedTouchableOpacity
        onPress={props.onPress}
        testID='token_select_button'
        dark={tailwind('bg-gray-800 border-gray-400')}
        light={tailwind('bg-white border-gray-300')}
        style={tailwind('flex flex-row items-center border rounded p-2')}
      >
        {props.symbol === undefined &&
          <ThemedText
            dark={tailwind('text-gray-400')}
            light={tailwind('text-gray-500')}
            style={tailwind('text-sm leading-6')}
          >
            Select Token
          </ThemedText>}

        {props.symbol !== undefined &&
          <>
            <Icon testID='tokenA_icon' height={17} width={17} />
            <ThemedText style={tailwind('text-gray-500 ml-2')}>{props.symbol}</ThemedText>
          </>}

        <ThemedIcon
          iconType='MaterialIcons'
          name='unfold-more'
          size={20}
          dark={tailwind('text-darkprimary-500')}
          light={tailwind('text-primary-500')}
          style={[tailwind('text-center mt-0.5'), { marginLeft: 'auto' }]}
        />
      </ThemedTouchableOpacity>
    </View>
  )
}

function TransactionDetailsSection ({ estimatedAmount, fee, tokenB }: {estimatedAmount: string, fee: BigNumber, tokenB: DerivedTokenState}): JSX.Element {
  return (
    <>
      <ThemedSectionTitle
        testID='title_add_detail'
        text={translate('screens/CompositePoolSwapScreen', 'TRANSACTION DETAILS')}
        style={tailwind('px-4 pt-6 pb-2 text-xs text-gray-500 font-medium')}
      />
      <TextRow
        lhs='Estimated to receive'
        rhs={{
          value: `${estimatedAmount} ${tokenB.displaySymbol}`,
          testID: 'estimated_to_receive'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <TextRow
        lhs='Slippage Tolerance'
        rhs={{
          value: '3%',
          testID: 'slippage_tolerance'
        }}
        textStyle={tailwind('text-sm font-normal')}
      />
      <FeeInfoRow
        type='ESTIMATED_FEE'
        value={fee.toFixed(8)}
        testID='text_fee'
        suffix='DFI'
      />
    </>
  )
}

// TODO - Revisit all these calculations if applicable to composite swap
function getReserveAmount (id: string, poolpair: PoolPairData): string {
  return id === poolpair.tokenA.id ? poolpair.tokenA.reserve : poolpair.tokenB.reserve
}

function getPriceRate (reserveA: string, reserveB: string): string {
  return new BigNumber(reserveA).div(reserveB).toFixed(8)
}

function calculateEstimatedAmount (tokenAAmount: string, reserveA: string, price: string): BigNumber {
  tokenAAmount = tokenAAmount !== undefined && tokenAAmount !== '' ? tokenAAmount : '0'
  const slippage = (new BigNumber(1).minus(new BigNumber(tokenAAmount).div(reserveA)))
  return new BigNumber(tokenAAmount).times(price).times(slippage)
}

interface TokenForm {
  control: Control<{tokenA: string, tokenB: string}>
  controlName: 'tokenA' | 'tokenB'
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
            placeholder={isDisabled ? undefined : translate('screens/CompositePoolSwapScreen', 'Enter an amount')}
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
