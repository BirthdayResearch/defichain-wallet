import { CTransactionSegWit } from '@defichain/jellyfish-transaction/dist'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { Logging } from '../../../../api'
import { ConfirmTitle, NumberRow, SubmitButtonGroup, TokenBalanceRow } from '../../../../components/ConfirmComponents'
import { SectionTitle } from '../../../../components/SectionTitle'
import { RootState } from '../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../store/transaction_queue'
import { hasTxQueued as hasBoardcastQueued } from '../../../../store/ocean'
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
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBoardcastQueued(state.ocean))
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
  const pair = props.route.params.pair
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aSymbol, bSymbol] = symbol.split('-') as [string, string]
  const aToBRate = new BigNumber(tokenB.reserve).div(tokenA.reserve)
  const bToARate = new BigNumber(tokenA.reserve).div(tokenB.reserve)
  const lmTokenAmount = percentage.times(totalLiquidity.token)
  const [isOnPage, setIsOnPage] = useState<boolean>(true)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const postAction = (): void => {
    if (isOnPage) {
      navigation.dispatch(StackActions.popToTop())
    }
  }

  useEffect(() => {
    setIsOnPage(true)
    return () => {
      setIsOnPage(false)
    }
  }, [])

  const dispatch = useDispatch()

  async function addLiquidity (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    constructSignedAddLiqAndSend(
      {
        tokenASymbol: tokenA.symbol,
        tokenAId: Number(tokenA.id),
        tokenAAmount,
        tokenBSymbol: tokenB.symbol,
        tokenBId: Number(tokenB.id),
        tokenBAmount
      },
      dispatch,
      postAction
    ).catch(e => {
      Logging.error(e)
    }).finally(() => setIsSubmitting(false))
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'AddLiquidity',
        params: { pair },
        merge: true
      })
    }
  }

  return (
    <ScrollView testID='confirm-root' style={tailwind('bg-gray-100 pb-4')}>
      <ConfirmTitle
        title={translate('screens/ConfirmAddLiq', 'YOU ARE ADDING')}
        testID='text_add_amount' amount={lmTokenAmount}
        suffix={` ${symbol}`}
      />
      <SectionTitle
        text={translate('screens/ConfirmAddLiq', 'AMOUNT TO SUPPLY')}
        testID='title_add_detail'
      />
      <TokenBalanceRow
        iconType={aSymbol}
        lhs={aSymbol}
        rhs={{
          value: BigNumber.max(tokenAAmount, 0).toFixed(8),
          testID: 'a_amount'
        }}
      />
      <TokenBalanceRow
        iconType={bSymbol}
        lhs={bSymbol}
        rhs={{
          value: BigNumber.max(tokenBAmount, 0).toFixed(8),
          testID: 'b_amount'
        }}
      />
      <SectionTitle
        text={translate('screens/ConfirmAddLiq', 'TRANSACTION DETAILS')}
        testID='title_tx_detail'
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', 'Price')}
        rightHandElements={[
          { value: aToBRate.toFixed(8), suffix: ` ${bSymbol} per ${aSymbol}`, testID: 'price_a' },
          { value: bToARate.toFixed(8), suffix: ` ${aSymbol} per ${bSymbol}`, testID: 'price_b' }
        ]}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', 'Share of pool')}
        rightHandElements={[{ value: percentage.times(100).toFixed(8), suffix: ' %', testID: 'percentage_pool' }]}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', `Pooled ${aSymbol}`)}
        rightHandElements={[{ value: tokenA.reserve, suffix: ` ${tokenA.symbol}`, testID: 'pooled_a' }]}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', `Pooled ${bSymbol}`)}
        rightHandElements={[{ value: tokenB.reserve, suffix: ` ${tokenB.symbol}`, testID: 'pooled_b' }]}
      />
      <NumberRow
        lhs={translate('screens/ConfirmAddLiq', 'Estimated fee')}
        rightHandElements={[{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }]}
      />
      <SubmitButtonGroup
        onSubmit={addLiquidity} onCancel={onCancel} title='add'
        label={translate('screens/ConfirmAddLiq', 'ADD')}
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
      />
    </ScrollView>
  )
}

async function constructSignedAddLiqAndSend (
  addLiqForm: { tokenASymbol: string, tokenAId: number, tokenAAmount: BigNumber, tokenBSymbol: string, tokenBId: number, tokenBAmount: BigNumber },
  dispatch: Dispatch<any>,
  postAction: () => void
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
  const message = `Adding ${addLiqForm.tokenAAmount.toFixed(8)} ${addLiqForm.tokenASymbol} - ${addLiqForm.tokenBAmount.toFixed(8)} ${addLiqForm.tokenBSymbol}`
  dispatch(transactionQueue.actions.push({
    sign: signer,
    title: `${translate('screens/ConfirmLiquidity', 'Adding Liquidity')}`,
    description: `${translate('screens/ConfirmLiquidity', message)}`,
    postAction
  }))
}
