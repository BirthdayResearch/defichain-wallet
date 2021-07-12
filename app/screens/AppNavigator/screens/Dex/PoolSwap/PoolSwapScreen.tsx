import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { MaterialIcons } from '@expo/vector-icons'
import { StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
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

interface SwapSummaryItems {
  poolpair: PoolPairData
  tokenA: AddressToken
  tokenB: AddressToken
}

type Props = StackScreenProps<DexParamList, 'PoolSwapScreen'>

export function PoolSwapScreen ({ route }: Props): JSX.Element {
  const navigation = useNavigation()
  const poolpair = route.params.poolpair
  const tokens = useTokensAPI()
  const [tokenAForm, tokenBForm] = ['tokenA', 'tokenB']
  const [tokenA, setTokenA] = useState<AddressToken>()
  const [tokenB, setTokenB] = useState<AddressToken>()
  const { control, setValue, formState: { isValid }, getValues, trigger } = useForm({ mode: 'onChange' })

  const whaleApiClient = useWhaleApiClient()
  const account = useWallet().get(0)

  function onSubmit (): void {
    const atA = poolpair.tokenA.id === tokenA?.id ? poolpair.tokenA : poolpair.tokenB
    const atB = poolpair.tokenA.id === tokenB?.id ? poolpair.tokenA : poolpair.tokenB

    if (tokenA !== undefined && tokenB !== undefined && atA !== undefined && atB !== undefined && isValid) {
      const swap = {
        fromToken: tokenA,
        toToken: tokenB,
        fromAmount: new BigNumber((getValues()[tokenAForm])),
        currentAToBPrice: new BigNumber(atB.reserve).div(atA.reserve)
      }
      // no longer a promise after refactor to network drawer
      constructSignedSwapAndSend(account, swap, whaleApiClient)
        .then(() => navigation.dispatch(StackActions.popToTop()))
        .catch(e => console.log(e))
    }
  }

  function swapToken (): void {
    setTokenA(tokenB)
    setTokenB(tokenA)
  }

  useEffect(() => {
    const a = tokens.find((token) => token.id === poolpair.tokenA.id)
    setTokenA(a)
    const b = tokens.find((token) => token.id === poolpair.tokenB.id)
    setTokenB(b)
  }, [])

  if (tokenA === undefined || tokenB === undefined) {
    return <LoadingScreen />
  }

  return (
    <ScrollView style={tailwind('bg-gray-100')}>
      <TokenRow
        token={tokenA} control={control} controlName={tokenAForm}
        title={translate('screens/PoolSwapScreen', 'From')} onMaxPress={async (amount) => {
          setValue(tokenAForm, amount)
          await trigger(tokenAForm)
        }}
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
          <SwapSummary poolpair={poolpair} tokenA={tokenA} tokenB={tokenB} />
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
  token: AddressToken
  onMaxPress?: (amount: string) => void
  title: string
}

function TokenRow ({ token, control, onMaxPress, title, controlName }: TokenForm): JSX.Element {
  const Icon = getTokenIcon(token.symbol)
  const rules: { required: boolean, pattern: RegExp, max?: string } = {
    required: true,
    pattern: /^\d*\.?\d*$/
  }
  if (onMaxPress !== undefined) {
    rules.max = token.amount
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
              onChangeText={onChange}
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
          (onMaxPress != null) && (
            <TouchableOpacity testID='max_button_token_a' onPress={() => onMaxPress(token.amount)}>
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

function SwapSummary ({ poolpair, tokenA, tokenB }: SwapSummaryItems): JSX.Element {
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
        values={[{ amount: '1', symbol: tokenB.symbol }]}
      />
      <PriceRow
        title={translate('screens/PoolSwapScreen', 'Minimum to receive')}
        values={[{ amount: '1', symbol: tokenB.symbol }]}
      />
      <PriceRow
        title={translate('screens/PoolSwapScreen', 'Liquidity provider fee')}
        values={[{ amount: '1', symbol: 'DFI' }]}
      />
    </View>
  )
}

interface DexForm {
  fromToken: AddressToken
  toToken: AddressToken
  fromAmount: BigNumber
  currentAToBPrice: BigNumber
  slippagePercentage?: number
}
async function constructSignedSwapAndSend (
  account: WhaleWalletAccount, // must be both owner and recipient for simplicity
  dexForm: DexForm,
  // dispatch: Dispatch<any>
  whaleAPI: WhaleApiClient
): Promise<void> {
  const builder = account.withTransactionBuilder()

  const maxPrice = dexForm.currentAToBPrice.times(100 + (dexForm.slippagePercentage ?? 5)).div(100)
  const integer = maxPrice.integerValue(BigNumber.ROUND_FLOOR)
  const fraction = maxPrice.modulo(1)

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
