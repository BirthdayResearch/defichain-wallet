import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { FlatList } from 'react-native'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { useCallback } from 'react'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { StackActions, useNavigation } from '@react-navigation/native'
import { PrimaryButton } from '../../../../components/PrimaryButton'
import NumberFormat from 'react-number-format'
import { useWhaleApiClient } from '../../../../contexts/WhaleContext'
import { useWallet } from '../../../../contexts/WalletContext'

type Props = StackScreenProps<DexParamList, 'ConfirmAddLiquidity'>

export interface AddLiquiditySummary extends PoolPairData {
  fee: BigNumber // stick to whatever estimation/calculation done on previous page
  tokenAAmount: BigNumber
  tokenBAmount: BigNumber
  percentage: BigNumber // to add
}

export function ConfirmAddLiquidityScreen (props: Props): JSX.Element {
  const navigation = useNavigation()

  const {
    fee,
    percentage,
    tokenA,
    tokenAAmount,
    tokenB,
    tokenBAmount,
    symbol,
    totalLiquidity
  } = props.route.params.summary
  const [aSymbol, bSymbol] = symbol.split('-') as [string, string]
  const aToBRate = new BigNumber(tokenB.reserve).div(tokenA.reserve)
  const bToARate = new BigNumber(tokenA.reserve).div(tokenB.reserve)
  const lmTokenAmount = percentage.times(totalLiquidity)

  const whaleAPI = useWhaleApiClient()
  const account = useWallet().get(0)
  // const account = getDefaultWallet().get(0) // getting error: must call useCachedWallet() first

  const addLiquidity = useCallback(() => {
    // TODO: add loading spinner after we have standardized design
    constructSignedAddLiqAndSend(
      whaleAPI,
      account,
      {
        tokenAId: Number(tokenA.id),
        tokenAAmount,
        tokenBId: Number(tokenB.id),
        tokenBAmount
      }
    ).then(() => {
      navigation.dispatch(StackActions.popToTop())
    }).catch(e => {
      // TODO: display error, close modal to retry/redirect
      console.log(e)
    })
  }, [props.route.params.summary])

  const items: Array<{ lhs: string, rhs: Array<{value: string | number, suffix?: string, testID: string}> }> = [
    {
      lhs: translate('screens/ConfirmAddLiq', 'Adding'),
      rhs: [
        { value: tokenAAmount.toNumber(), suffix: ` ${aSymbol}`, testID: 'adding_a' },
        { value: tokenBAmount.toNumber(), suffix: ` ${bSymbol}`, testID: 'adding_b' }
      ]
    },
    {
      lhs: translate('screens/ConfirmAddLiq', 'Fee'),
      rhs: [
        { value: fee.toNumber(), suffix: ' DFI', testID: 'fee' }
      ]
    },
    {
      lhs: translate('screens/ConfirmAddLiq', 'Price'),
      rhs: [
        { value: aToBRate.toNumber(), suffix: ` ${bSymbol} / ${aSymbol}`, testID: 'price_a' },
        { value: bToARate.toNumber(), suffix: ` ${aSymbol} / ${bSymbol}`, testID: 'price_b' }
      ]
    },
    {
      lhs: translate('screens/ConfirmAddLiq', 'Liquidity tokens received'),
      rhs: [
        { value: lmTokenAmount.toNumber(), suffix: ` ${symbol}`, testID: 'liquidity_tokens_received' }
      ]
    },
    {
      lhs: translate('screens/ConfirmAddLiq', 'Share of pool'),
      rhs: [
        { value: percentage.toNumber(), suffix: ' %', testID: 'share_of_pool' }
      ]
    },
    {
      lhs: `${translate('screens/ConfirmAddLiq', 'Pooled')} ${aSymbol}`,
      rhs: [
        { value: tokenA.reserve, testID: 'pooled_a' }
      ]
    },
    {
      lhs: `${translate('screens/ConfirmAddLiq', 'Pooled')} ${bSymbol}`,
      rhs: [
        { value: tokenB.reserve, testID: 'pooled_b' }
      ]
    }
  ]

  return (
    <View testID='confirm-root' style={tailwind('w-full h-full')}>
      <FlatList
        style={tailwind('w-full flex-col flex-1')}
        data={items}
        renderItem={({ item }) => <Row lhs={item.lhs} rhs={item.rhs} />}
        ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
        ListHeaderComponent={<View style={tailwind('w-full h')} />}
      />
      <ConfirmButton onPress={() => addLiquidity()} />
    </View>
  )
}

function Row (props: { lhs: string, rhs: Array<{value: string | number, suffix?: string, testID: string}> }): JSX.Element {
  return (
    <View style={tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full')}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        {
          props.rhs.map((value, idx) => (
            <NumberFormat
              value={value.value} decimalScale={8} thousandSeparator displayType='text' suffix={value.suffix} key={idx}
              renderText={(val: string) => <Text testID={`text_${value.testID}`} style={tailwind('font-medium text-right text-gray-500')}>{val}</Text>}
            />
          ))
        }
      </View>
    </View>
  )
}

function ConfirmButton (props: { onPress: () => void }): JSX.Element {
  return (
    <PrimaryButton
      testID='button_confirm_add_liq'
      title='Confirm'
      touchableStyle={tailwind('m-2')}
      onPress={props.onPress}
    >
      <Text style={[tailwind('text-white font-bold')]}>{translate('screens/ConfirmLiquidity', 'CONFIRM')}</Text>
    </PrimaryButton>
  )
}

async function constructSignedAddLiqAndSend (
  whaleAPI: WhaleApiClient, account: WhaleWalletAccount,
  addLiqForm: { tokenAId: number, tokenAAmount: BigNumber, tokenBId: number, tokenBAmount: BigNumber }
): Promise<string> {
  const builder = account.withTransactionBuilder()

  const script = await account.getScript()
  const addLiq = {
    from: [{
      script,
      balances: [
        { token: addLiqForm.tokenAId, amount: addLiqForm.tokenAAmount },
        { token: addLiqForm.tokenBId, amount: addLiqForm.tokenBAmount }
      ]
    }],
    shareAddress: script
  }

  const dfTx = await builder.liqPool.addLiquidity(addLiq, script)
  const hex = new CTransactionSegWit(dfTx).toHex()
  return await whaleAPI.transactions.send({ hex })
}
