import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState, useCallback } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import NumberFormat from 'react-number-format'
import tailwind from 'tailwind-rn'
import { Text, TextInput } from '../../../../../components'
import { getTokenIcon } from '../../../../../components/icons/tokens/_index'
import { PrimaryButton } from '../../../../../components/PrimaryButton'
import { PrimaryColor, PrimaryColorStyle } from '../../../../../constants/Theme'
import { useWallet } from '../../../../../contexts/WalletContext'
import { useWhaleApiClient } from '../../../../../contexts/WhaleContext'
import { useTokensAPI } from '../../../../../hooks/wallet/TokensAPI'
import { translate } from '../../../../../translations'
import LoadingScreen from '../../../../LoadingNavigator/LoadingScreen'
import { DexParamList } from '../DexNavigator'

interface DerivedTokenState {
  id: string
  amount: string
  symbol: string
}

interface SwapSummaryItems {
  poolpair: PoolPairData
  tokenA: DerivedTokenState
  tokenB: DerivedTokenState
  tokenAAmount: string
  tokenBAmount: string
}

type Props = StackScreenProps<DexParamList, 'PoolSwapScreen'>

export function PoolSwapScreen ({ route }: Props): JSX.Element {
  const navigation = useNavigation()
  const poolpair = route.params.poolpair
  const tokens = useTokensAPI()
  const [tokenAForm, tokenBForm] = ['tokenA', 'tokenB']

  // props derived state
  const [tokenA, setTokenA] = useState<DerivedTokenState>()
  const [tokenB, setTokenB] = useState<DerivedTokenState>()

  // component UI state
  const { control, setValue, formState: { isValid }, getValues, trigger, watch } = useForm({ mode: 'onChange' })
  const tokenAAmount = watch(tokenAForm)
  const tokenBAmount = watch(tokenBForm)

  const whaleApiClient = useWhaleApiClient()
  const account = useWallet().get(0)

  function onSubmit (): void {
    if (tokenA === undefined || tokenB === undefined) return

    const atA = poolpair.tokenA.id === tokenA?.id ? poolpair.tokenA : poolpair.tokenB
    const atB = poolpair.tokenA.id === tokenB?.id ? poolpair.tokenA : poolpair.tokenB

    if (tokenA !== undefined && tokenB !== undefined && atA !== undefined && atB !== undefined && isValid) {
      const swap = {
        fromToken: tokenA,
        toToken: tokenB,
        fromAmount: new BigNumber((getValues()[tokenAForm])),
        toAmount: new BigNumber((getValues()[tokenBForm]))
      }
      // no longer a promise after refactor to network drawer
      constructSignedSwapAndSend(account, swap, whaleApiClient)
        .then(() => navigation.dispatch(StackActions.popToTop()))
        .catch(e => console.log(e))
    }
  }

  const swapToken = useCallback((): void => {
    setTokenA(tokenB)
    setTokenB(tokenA)
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
  }, [route.params.poolpair, tokens])

  if (tokenA === undefined || tokenB === undefined) {
    return <LoadingScreen />
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <TokenRow
        token={tokenA} control={control} controlName={tokenAForm}
        title={translate('screens/PoolSwapScreen', 'From')}
        customCallback={async (amount) => {
          setValue(tokenAForm, amount)
          await trigger(tokenAForm)
          setValue(tokenBForm, amount)
          await trigger(tokenBForm)
        }}
        maxAmount={tokenA.amount}
      />
      <TouchableOpacity style={tailwind('justify-center items-center mt-4')} onPress={swapToken} testID='swap_button'>
        <MaterialIcons name='swap-vert' size={28} color={PrimaryColor} />
      </TouchableOpacity>
      <TokenRow
        token={tokenB} control={control} controlName={tokenBForm}
        title={translate('screens/PoolSwapScreen', 'To')}
      />
      {
        (new BigNumber(getValues()[tokenAForm]).isGreaterThan(0) && new BigNumber(getValues()[tokenBForm]).isGreaterThan(0)) &&
          <SwapSummary poolpair={poolpair} tokenA={tokenA} tokenB={tokenB} tokenAAmount={tokenAAmount} tokenBAmount={tokenBAmount} />
      }
      <PrimaryButton disabled={!isValid} title='Swap' onPress={onSubmit} testID='button_submit'>
        <Text style={tailwind('text-white font-bold')}>{translate('screens/PoolSwapScreen', 'SWAP')}</Text>
      </PrimaryButton>
    </ScrollView>
  )
}

interface TokenForm {
  control: Control
  controlName: string
  token: DerivedTokenState
  enableMaxButton?: boolean
  maxAmount?: string
  customCallback?: (amount: string) => void
  title: string
}

function TokenRow (form: TokenForm): JSX.Element {
  const { token, control, customCallback, title, controlName, enableMaxButton = true } = form
  const Icon = getTokenIcon(token.symbol)
  const rules: { required: boolean, pattern: RegExp, max?: string } = {
    required: true,
    pattern: /^\d*\.?\d*$/
  }
  if (form.maxAmount !== undefined) {
    rules.max = form.maxAmount
  }
  return (
    <>
      <Text style={tailwind('text-sm font-bold pl-4 pt-4 mt-4 bg-white flex-grow')}>
        {title}
      </Text>
      <Controller
        control={control}
        rules={rules}
        render={({ field: { onBlur, onChange, value } }) => (
          <View style={tailwind('flex-row w-full border-b border-gray-100')}>
            <TextInput
              style={tailwind('flex-grow p-4 bg-white')}
              autoCapitalize='none'
              onBlur={onBlur}
              onChangeText={(text) => {
                if (customCallback !== undefined) customCallback(text)
                else onChange(text)
              }}
              value={value}
              keyboardType='numeric'
              placeholder={translate('screens/PoolSwapScreen', 'Enter an amount')}
              testID={`input_amount_${token.id}`}
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
      <View style={tailwind('flex-row w-full bg-white p-4')}>
        <View style={tailwind('flex-grow flex-row')}>
          <Text>{translate('screens/PoolSwapScreen', 'Balance: ')}</Text>
          <NumberFormat
            value={token.amount} decimalScale={8} thousandSeparator displayType='text' suffix={` ${token.symbol}`}
            renderText={(value) => <Text style={tailwind('text-gray-500')}>{value}</Text>}
          />
        </View>
        {
          (enableMaxButton != null && customCallback !== undefined) && (
            <TouchableOpacity testID='max_button_token_a' onPress={() => customCallback(token.amount)}>
              <Text
                style={[PrimaryColorStyle.text, tailwind('font-bold')]}
              >{translate('screens/PoolSwapScreen', 'MAX')}
              </Text>
            </TouchableOpacity>
          )
        }

      </View>
    </>
  )
}

function PriceRow ({
  title,
  values
}: { title: string, values: Array<{ amount: string, symbol: string }> }): JSX.Element {
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
                <Text style={tailwind('text-gray-500 text-right ml-1')}>
                  {value}
                </Text>
              )}
            />))
        }
      </View>
    </View>
  )
}

function SwapSummary ({ poolpair, tokenA, tokenB, tokenAAmount, tokenBAmount }: SwapSummaryItems): JSX.Element {
  const reserveA = tokenA.id === poolpair.tokenA.id ? poolpair.tokenA.reserve : poolpair.tokenB.reserve
  const reserveB = tokenB.id === poolpair.tokenB.id ? poolpair.tokenB.reserve : poolpair.tokenA.reserve
  const price = [{
    amount: new BigNumber(reserveA).div(reserveB).toFixed(),
    symbol: `${tokenA.symbol} per ${tokenB.symbol}`
  },
  { amount: new BigNumber(reserveB).div(reserveA).toFixed(), symbol: `${tokenB.symbol} per ${tokenA.symbol}` }]
  return (
    <View style={tailwind('mt-4')}>
      <PriceRow
        title={translate('screens/PoolSwapScreen', 'Price')}
        values={price}
      />
      <PriceRow
        title={translate('screens/PoolSwapScreen', 'Estimated to receive')}
        values={[{ amount: tokenAAmount, symbol: tokenB.symbol }]}
      />
      <PriceRow
        title={translate('screens/PoolSwapScreen', 'Minimum to receive')}
        values={[{ amount: tokenBAmount, symbol: tokenB.symbol }]}
      />
      <PriceRow
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
  // dispatch: Dispatch<any>
  whaleAPI: WhaleApiClient
): Promise<void> {
  const builder = account.withTransactionBuilder()

  const maxPrice = dexForm.toAmount.div(dexForm.fromAmount)

  // will be handled in jellyfish soon (submit maxPrice as a single BN)
  const integer = maxPrice.integerValue(BigNumber.ROUND_FLOOR)
  const fraction = maxPrice.modulo(1).times('1e8')

  const script = await account.getScript()
  const swap: PoolSwap = {
    fromScript: script,
    toScript: script,
    fromTokenId: Number(dexForm.fromToken.id),
    toTokenId: Number(dexForm.toToken.id),
    fromAmount: dexForm.fromAmount,
    maxPrice: { integer, fraction }
  }

  const dfTx = await builder.dex.poolSwap(swap, script)
  const signed = new CTransactionSegWit(dfTx)

  // dispatch(store.networkDrawer.action.push(signed))
  await whaleAPI.transactions.send({ hex: signed.toHex() })
}
