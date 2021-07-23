import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpair'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useCallback } from 'react'
import { FlatList } from 'react-native'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { Logging } from '../../../../api/logging'
import { Text, View } from '../../../../components'
import { PrimaryButton } from '../../../../components/PrimaryButton'
import { RootState } from '../../../../store'
import { hasTxQueued, ocean } from '../../../../store/ocean'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'ConfirmAddLiquidity'>

export interface AddLiquiditySummary extends PoolPairData {
  fee: BigNumber // stick to whatever estimation/calculation done on previous page
  tokenAAmount: BigNumber
  tokenBAmount: BigNumber
  percentage: BigNumber // to add
}

export function ConfirmAddLiquidityScreen (props: Props): JSX.Element {
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.ocean))
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
  const dispatch = useDispatch()

  const addLiquidity = useCallback(() => {
    if (hasPendingJob) return
    constructSignedAddLiqAndSend(
      {
        tokenAId: Number(tokenA.id),
        tokenAAmount,
        tokenBId: Number(tokenB.id),
        tokenBAmount
      },
      dispatch
    ).catch(e => {
      Logging.error(e)
      dispatch(ocean.actions.setError(e))
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
        { value: aToBRate.toNumber(), suffix: ` ${bSymbol} per ${aSymbol}`, testID: 'price_a' },
        { value: bToARate.toNumber(), suffix: ` ${aSymbol} per ${bSymbol}`, testID: 'price_b' }
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
    <FlatList
      testID='confirm-root'
      style={tailwind('w-full flex-col mt-5')}
      data={items}
      keyExtractor={(item, index) => `${index}`}
      renderItem={({ item }) => <Row lhs={item.lhs} rhs={item.rhs} />}
      ItemSeparatorComponent={() => <View style={tailwind('h-px bg-gray-100')} />}
      ListFooterComponent={<ConfirmButton disabled={hasPendingJob} onPress={() => addLiquidity()} />}
    />
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

function ConfirmButton (props: { disabled?: boolean, onPress: () => void }): JSX.Element {
  return (
    <PrimaryButton
      testID='button_confirm_add_liq'
      title='Confirm'
      touchableStyle={tailwind('mb-2 mt-4')}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <Text style={[tailwind('text-white font-bold')]}>{translate('screens/ConfirmLiquidity', 'CONFIRM')}</Text>
    </PrimaryButton>
  )
}

async function constructSignedAddLiqAndSend (
  addLiqForm: { tokenAId: number, tokenAAmount: BigNumber, tokenBId: number, tokenBAmount: BigNumber },
  dispatch: Dispatch<any>
): Promise<void> {
  const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
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
    return new CTransactionSegWit(dfTx)
  }

  dispatch(ocean.actions.queueTransaction({
    sign: signer,
    title: `${translate('screens/ConfirmLiquidity', 'Adding Liquidity')}`
  }))
}
