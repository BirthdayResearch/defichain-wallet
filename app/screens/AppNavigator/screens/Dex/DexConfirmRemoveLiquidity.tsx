import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { NumberRow } from '../../../../components/NumberRow'
import { SectionTitle } from '../../../../components/SectionTitle'
import { SubmitButtonGroup } from '../../../../components/SubmitButtonGroup'
import { SummaryTitle } from '../../../../components/SummaryTitle'
import { ThemedScrollView } from '../../../../components/themed'
import { TokenBalanceRow } from '../../../../components/TokenBalanceRow'
import { RootState } from '../../../../store'
import { hasTxQueued as hasBroadcastQueued } from '../../../../store/ocean'
import { hasTxQueued, transactionQueue } from '../../../../store/transaction_queue'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'ConfirmRemoveLiquidity'>

export function RemoveLiquidityConfirmScreen ({ route }: Props): JSX.Element {
  const {
    pair,
    amount,
    fee,
    tokenAAmount,
    tokenBAmount
  } = route.params
  const aToBRate = new BigNumber(pair.tokenB.reserve).div(pair.tokenA.reserve)
  const bToARate = new BigNumber(pair.tokenA.reserve).div(pair.tokenB.reserve)
  const symbol = (pair?.tokenA != null && pair?.tokenB != null)
    ? `${pair.tokenA.displaySymbol}-${pair.tokenB.displaySymbol}`
    : pair.symbol
  const dispatch = useDispatch()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigation = useNavigation<NavigationProp<DexParamList>>()
  const [isOnPage, setIsOnPage] = useState<boolean>(true)

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

  async function onSubmit (): Promise<void> {
    if (hasPendingJob || hasPendingBroadcastJob) {
      return
    }
    setIsSubmitting(true)
    await constructSignedRemoveLiqAndSend(pair, amount, dispatch, postAction)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({
        name: 'RemoveLiquidity',
        params: { pair },
        merge: true
      })
    }
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <SummaryTitle
        amount={amount}
        suffix={` ${symbol}`}
        testID='text_remove_amount'
        title={translate('screens/ConfirmRemoveLiquidity', 'YOU ARE REMOVING')}
      />

      <SectionTitle
        testID='title_remove_detail'
        text={translate('screens/ConfirmRemoveLiquidity', 'ESTIMATED AMOUNT TO RECEIVE')}
      />

      <TokenBalanceRow
        iconType={pair?.tokenA?.displaySymbol}
        lhs={pair?.tokenA?.displaySymbol}
        rhs={{
          value: BigNumber.max(tokenAAmount, 0).toFixed(8),
          testID: 'a_amount'
        }}
      />

      <TokenBalanceRow
        iconType={pair?.tokenB?.displaySymbol}
        lhs={pair?.tokenB?.displaySymbol}
        rhs={{
          value: BigNumber.max(tokenBAmount, 0).toFixed(8),
          testID: 'b_amount'
        }}
      />

      <SectionTitle
        testID='title_tx_detail'
        text={translate('screens/ConfirmRemoveLiquidity', 'TRANSACTION DETAILS')}
      />

      <NumberRow
        lhs={translate('screens/ConfirmRemoveLiquidity', 'Price')}
        rightHandElements={[
          {
            value: aToBRate.toFixed(8),
            suffix: ` ${pair?.tokenB?.displaySymbol} per ${pair?.tokenA?.displaySymbol}`,
            testID: 'price_a'
          },
          {
            value: bToARate.toFixed(8),
            suffix: ` ${pair?.tokenA?.displaySymbol} per ${pair?.tokenB?.displaySymbol}`,
            testID: 'price_b'
          }
        ]}
      />

      <NumberRow
        lhs={translate('screens/ConfirmRemoveLiquidity', 'Estimated fee')}
        rightHandElements={[{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }]}
      />

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={translate('screens/ConfirmRemoveLiquidity', 'REMOVE')}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='remove'
      />
    </ThemedScrollView>
  )
}

async function constructSignedRemoveLiqAndSend (pair: PoolPairData, amount: BigNumber, dispatch: Dispatch<any>, postAction: () => void): Promise<void> {
  const tokenId = Number(pair.id)
  const symbol = (pair?.tokenA != null && pair?.tokenB != null)
    ? `${pair.tokenA.displaySymbol}-${pair.tokenB.displaySymbol}`
    : pair.symbol

  const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
    const builder = account.withTransactionBuilder()
    const script = await account.getScript()

    const removeLiq = {
      script,
      tokenId,
      amount
    }
    const dfTx = await builder.liqPool.removeLiquidity(removeLiq, script)
    return new CTransactionSegWit(dfTx)
  }

  dispatch(transactionQueue.actions.push({
    sign: signer,
    title: translate('screens/RemoveLiquidity', 'Removing Liquidity'),
    description: translate('screens/RemoveLiquidity', 'Removing {{amount}} {{symbol}}', {
      symbol: symbol,
      amount: amount.toFixed(8)
    }),
    postAction
  }))
}
