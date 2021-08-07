import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useState } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { Logging } from '../../../../../api'
import { Text, TextInput } from '../../../../../components'
import { Button } from '../../../../../components/Button'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import LoadingScreen from '../../../../../components/LoadingScreen'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { AmountButtonTypes, SetAmountButton } from '../../../../../components/SetAmountButton'
import { useWallet } from '../../../../../contexts/WalletContext'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { RootState } from '../../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { DexParamList } from '../DexNavigator'

interface DerivedTokenState {
  id: string
  amount: string
  symbol: string
}

type Props = StackScreenProps<DexParamList, 'PoolSwapScreen'>

export function PoolSwapScreen ({ route }: Props): JSX.Element {
  const poolpair = route.params.poolpair
  const tokens = useTokensAPI()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const [tokenAForm, tokenBForm] = ['tokenA', 'tokenB']

  // props derived state
  const [tokenA, setTokenA] = useState<DerivedTokenState>()
  const [tokenB, setTokenB] = useState<DerivedTokenState>()
  const [isComputing, setIsComputing] = useState<boolean>(false)

  // component UI state
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })

  const account = useWallet().get(0)
  const dispatch = useDispatch()

  function onSubmit (): void {
    if (hasPendingJob) return
    if (tokenA === undefined || tokenB === undefined) {
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
      constructSignedSwapAndSend(account, swap, dispatch)
        .catch(e => {
          Logging.error(e)
        })
    }
  }

  const swapToken = useCallback(async (): Promise<void> => {
    setTokenA(tokenB)
    setTokenB(tokenA)
    const { [tokenAForm]: currentA, [tokenBForm]: currentB } = getValues()
    setValue(tokenAForm, currentB)
    await trigger(tokenAForm)
    setValue(tokenBForm, currentA)
    await trigger(tokenBForm)
  }, [tokenA, tokenB])

  useEffect(() => {
    const [tokenASymbol, tokenBSymbol] = poolpair.symbol.split('-') as [string, string]
    const a = tokens.find((token) => token.id === poolpair.tokenA.id) ?? {
      id: poolpair.tokenA.id,
      amount: '0',
      symbol: tokenASymbol
    }
    setTokenA(a)
    const b = tokens.find((token) => token.id === poolpair.tokenB.id) ?? {
      id: poolpair.tokenB.id,
      amount: '0',
      symbol: tokenBSymbol
    }
    setTokenB(b)
  }, [route.params.poolpair, JSON.stringify(tokens)])

  if (tokenA === undefined || tokenB === undefined) {
    return <LoadingScreen />
  }

  const aToBPrice = tokenA.id === poolpair.tokenA.id
    ? new BigNumber(poolpair.tokenB.reserve).div(poolpair.tokenA.reserve)
    : new BigNumber(poolpair.tokenA.reserve).div(poolpair.tokenB.reserve)

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <TokenRow
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
      <TouchableOpacity style={tailwind('justify-center items-center mt-6')} onPress={swapToken} testID='swap_button'>
        <MaterialIcons name='swap-vert' size={28} style={tailwind('text-primary')} />
      </TouchableOpacity>
      <TokenRow
        token={tokenB} control={control} controlName={tokenBForm}
        title={`${translate('screens/PoolSwapScreen', 'TO')} ${tokenB.symbol}`}
        maxAmount={aToBPrice.times(getValues()[tokenAForm]).toFixed(8)}
      />
      {
        !isComputing && (new BigNumber(getValues()[tokenAForm]).isGreaterThan(0) && new BigNumber(getValues()[tokenBForm]).isGreaterThan(0)) &&
          <SwapSummary
            poolpair={poolpair} tokenA={tokenA} tokenB={tokenB} tokenAAmount={getValues()[tokenAForm]}
            tokenBAmount={getValues()[tokenBForm]}
          />
      }
      <Button
        disabled={!isValid || hasPendingJob}
        label={translate('screens/PoolSwapScreen', 'SWAP')}
        title='Swap' onPress={onSubmit} testID='button_submit'
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
}

function TokenRow (form: TokenForm): JSX.Element {
  const { token, control, onChangeFromAmount, title, controlName, enableMaxButton = true } = form
  const Icon = getTokenIcon(token.symbol)
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
            <TextInput
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              onBlur={onBlur}
              onChange={(e) => {
                if (onChangeFromAmount !== undefined) {
                  onChangeFromAmount(e.nativeEvent.text)
                } else onChange(e)
              }}
              value={value}
              keyboardType='numeric'
              placeholder={translate('screens/PoolSwapScreen', 'Enter an amount')}
              testID={`text_input_${controlName}`}
            />
            <View style={tailwind('flex-row bg-white pr-4 items-center')}>
              <Icon />
              <Text style={tailwind('ml-2')}>{token.symbol}</Text>
            </View>
          </View>
        )}
        name={controlName}
        defaultValue=''
      />
      <View style={tailwind('flex-row w-full bg-white px-4 items-center')}>
        <View style={tailwind('flex-1 flex-row py-4')}>
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

function PriceRow ({
  testID,
  title,
  values
}: { testID: string, title: string, values: Array<{ amount: string, symbol: string }> }): JSX.Element {
  return (
    <View style={tailwind('flex-row w-full border-b border-gray-100 bg-white p-4')}>
      <Text>{title}</Text>
      <View style={tailwind('flex-col flex-grow')}>
        {
          values.map((token, index) => (
            <NumberFormat
              key={index}
              value={token.amount} decimalScale={8} thousandSeparator
              displayType='text' suffix={` ${token.symbol}`}
              renderText={(value) => (
                <Text testID={`text_price_row_${testID}_${index}`} style={tailwind('text-gray-500 text-right ml-1')}>
                  {value}
                </Text>
              )}
            />))
        }
      </View>
    </View>
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
  const price = [{
    amount: new BigNumber(reserveA).div(reserveB).toFixed(8),
    symbol: `${tokenA.symbol} per ${tokenB.symbol}`
  },
  { amount: new BigNumber(reserveB).div(reserveA).toFixed(8), symbol: `${tokenB.symbol} per ${tokenA.symbol}` }]
  return (
    <View style={tailwind('mt-4')}>
      <PriceRow
        testID='price'
        title={translate('screens/PoolSwapScreen', 'Price')}
        values={price}
      />
      <PriceRow
        testID='estimated'
        title={translate('screens/PoolSwapScreen', 'Estimated to receive')}
        values={[{
          amount: calculateEstimatedAmount(tokenAAmount, reserveA, price[1].amount).toFixed(8),
          symbol: tokenB.symbol
        }]}
      />
      <PriceRow
        testID='fee'
        title={translate('screens/PoolSwapScreen', 'Liquidity provider fee')}
        values={[{ amount: '0.001', symbol: 'DFI' }]}
      />
    </View>
  )
}

interface DexForm {
  fromToken: DerivedTokenState
  toToken: DerivedTokenState
  fromAmount: BigNumber
  toAmount: BigNumber
}

async function constructSignedSwapAndSend (
  account: WhaleWalletAccount, // must be both owner and recipient for simplicity
  dexForm: DexForm,
  dispatch: Dispatch<any>
): Promise<void> {
  const maxPrice = dexForm.fromAmount.div(dexForm.toAmount).decimalPlaces(8)
  const signer = async (): Promise<CTransactionSegWit> => {
    const builder = account.withTransactionBuilder()
    const script = await account.getScript()

    const swap: PoolSwap = {
      fromScript: script,
      toScript: script,
      fromTokenId: Number(dexForm.fromToken.id),
      toTokenId: Number(dexForm.toToken.id),
      fromAmount: dexForm.fromAmount,
      maxPrice
    }
    const dfTx = await builder.dex.poolSwap(swap, script)
    return new CTransactionSegWit(dfTx)
  }

  dispatch(transactionQueue.actions.push({
    sign: signer,
    title: `${translate('screens/PoolSwapScreen', 'Swapping Token')}`
  }))
}

function calculateEstimatedAmount (tokenAAmount: string, reserveA: string, price: string): BigNumber {
  tokenAAmount = tokenAAmount !== undefined && tokenAAmount !== '' ? tokenAAmount : '0'
  const slippage = (new BigNumber(1).minus(new BigNumber(tokenAAmount).div(reserveA)))
  return new BigNumber(tokenAAmount).times(price).times(slippage)
}

function getReserveAmount (id: string, poolpair: PoolPairData): string {
  return id === poolpair.tokenA.id ? poolpair.tokenA.reserve : poolpair.tokenB.reserve
}
