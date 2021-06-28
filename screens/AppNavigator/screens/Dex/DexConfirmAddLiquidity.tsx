import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import tailwind from 'tailwind-rn'
import { Text, View } from '../../../../components'
import { translate } from '../../../../translations'
import { PrimaryColorStyle } from '../../../../constants/Theme'
import { DexParamList } from './DexNavigator'
import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder/dist'
import { WhaleFeeRateProvider, WhalePrevoutProvider, WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WalletHdNode } from '@defichain/jellyfish-wallet'
import { useCallback } from 'react'
import { useWalletAPI } from '../../../../hooks/wallet/WalletAPI'
import { useWhaleApiClient } from '../../../../hooks/api/useWhaleApiClient'
import { CTransactionSegWit, Script } from '@defichain/jellyfish-transaction/dist'
import { SmartBuffer } from 'smart-buffer'
import { StackActions, useNavigation } from '@react-navigation/native'

type Props = StackScreenProps<DexParamList, 'ConfirmAddLiquidity'>

export interface AddLiquiditySummary extends PoolPairData {
  fee: BigNumber // stick to whatever estimation/calculation done on previous page
  percentage: BigNumber // to add
}

export function ConfirmAddLiquidityScreen (props: Props): JSX.Element {
  const navigation = useNavigation()

  const {
    fee,
    percentage,
    tokenA,
    tokenB,
    symbol,
    totalLiquidity
  } = props.route.params.summary
  const [aSymbol, bSymbol] = symbol.split('-')
  const aToBRate = new BigNumber(tokenB.reserve).div(tokenA.reserve).toString()
  const bToARate = new BigNumber(tokenA.reserve).div(tokenB.reserve).toString()
  const lmTokenAmount = percentage.times(totalLiquidity).toString()

  // this component state
  const tokenAAmount = percentage.times(tokenA.reserve)
  const tokenBAmount = percentage.times(tokenB.reserve)

  const whaleAPI = useWhaleApiClient()
  const WalletAPI = useWalletAPI()

  const addLiquidity = useCallback(() => {
    const account = WalletAPI.getWallet().get(0) as WhaleWalletAccount

    // TODO: add loading spinner after we have standardized design
    constructSignedAddLiqAndSend(
      whaleAPI,
      account,
      Number(tokenA.id),
      tokenAAmount,
      Number(tokenB.id),
      tokenBAmount
    ).then(() => {
      navigation.dispatch(StackActions.popToTop())
    }).catch(e => {
      // TODO: display error, close modal to retry/redirect
      console.log(e)
    })
  }, [])

  return (
    <View style={tailwind('w-full h-full')}>
      <ScrollView style={tailwind('w-full flex-col flex-1')}>
        <TextRows lhs='Adding' rhs={[`${tokenAAmount.toString()} ${aSymbol}`, `${tokenBAmount.toString()} ${bSymbol}`]} rowStyle={tailwind('mt-4')} />
        <TextRows lhs='Fee' rhs={[`${fee.toString()} DFI`]} />
        <TextRows lhs='Price' rhs={[`${aToBRate} ${bSymbol} / ${aSymbol}`, `${bToARate} ${aSymbol} / ${bSymbol}`]} />
        <TextRows lhs='Liquidity tokens received' rhs={[`${lmTokenAmount} ${aSymbol}-${bSymbol}`]} />
        <TextRows lhs='Share of pool' rhs={[`${percentage.toString()} %`]} />
        <TextRows lhs={`Pooled ${aSymbol}`} rhs={[`${tokenA.reserve}`]} />
        <TextRows lhs={`Pooled ${bSymbol}`} rhs={[`${tokenB.reserve}`]} />
      </ScrollView>
      <View style={tailwind('w-full h-16')}>
        <ComfirmButton onPress={() => addLiquidity()} />
      </View>
    </View>
  )
}

function TextRows (props: { lhs: string, rhs: string[], rowStyle?: StyleProp<ViewStyle> }): JSX.Element {
  return (
    <View style={[tailwind('bg-white p-4 border-b border-gray-200 flex-row items-start w-full'), props.rowStyle]}>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('font-medium')}>{props.lhs}</Text>
      </View>
      <View style={tailwind('flex-1')}>
        {props.rhs.map((val, idx) => (<Text key={idx} style={tailwind('font-medium text-right text-gray-500')}>{val}</Text>))}
      </View>
    </View>
  )
}

function ComfirmButton (props: { onPress: () => void }): JSX.Element {
  return (
    <TouchableOpacity
      style={[tailwind('m-2 p-3 rounded flex-row justify-center'), PrimaryColorStyle.bg]}
      onPress={props.onPress}
    >
      <Text style={[tailwind('text-white font-bold')]}>{translate('screens/ConfirmLiquidity', 'CONFIRM')}</Text>
    </TouchableOpacity>
  )
}

async function constructSignedAddLiqAndSend (
  whaleAPI: WhaleApiClient, account: WhaleWalletAccount,
  tokenAId: number, tokenAAmount: BigNumber,
  tokenBId: number, tokenBAmount: BigNumber
): Promise<string> {
  const feeRate = new WhaleFeeRateProvider(whaleAPI)
  const prevout = new WhalePrevoutProvider(account, 50)
  const builder = new P2WPKHTransactionBuilder(feeRate, prevout, {
    // @ts-expect-error
    get: (_) => account.hdNode as WalletHdNode
  })

  const script = await account.getScript()
  const addLiq = {
    from: [{
      script,
      balances: [
        { token: tokenAId, amount: tokenAAmount },
        { token: tokenBId, amount: tokenBAmount }
      ]
    }],
    shareAddress: script
  }

  // for test use, make enough token
  // await convertForSufficientToken(whaleAPI, builder, script, tokenAAmount.minus(dfiTokenBalance))

  const dfTx = await builder.liqPool.addLiquidity(addLiq, script)
  const buffer = new SmartBuffer()
  new CTransactionSegWit(dfTx).toBuffer(buffer)
  return await whaleAPI.transactions.send({ hex: buffer.toString('hex') })
}

// used for move utxos to token for dev use, going to remove
// eslint-disable-next-line
async function convertForSufficientToken (whaleAPI: WhaleApiClient, builder: P2WPKHTransactionBuilder, script: Script, amount: BigNumber): Promise<string> {
  const utxosToAcc = await builder.account.utxosToAccount({
    to: [{
      script,
      balances: [
        { token: 0, amount }
      ]
    }]
  }, script)
  const utxosToAccBuffer = new SmartBuffer()
  new CTransactionSegWit(utxosToAcc).toBuffer(utxosToAccBuffer)
  return await whaleAPI.transactions.send({ hex: utxosToAccBuffer.toString('hex') })
}
