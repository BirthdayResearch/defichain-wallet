import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { PoolPairData } from '@defichain/whale-api-client/dist/api/poolpairs'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch } from 'redux'
import { ConfirmTitle, NumberRow, SubmitButtonGroup, TokenBalanceRow } from '../../../../components/ConfirmComponents'
import { SectionTitle } from '../../../../components/SectionTitle'
import { RootState } from '../../../../store'
import { hasTxQueued, transactionQueue } from '../../../../store/transaction_queue'
import { tailwind } from '../../../../tailwind'
import { translate } from '../../../../translations'
import { DexParamList } from './DexNavigator'

type Props = StackScreenProps<DexParamList, 'ConfirmRemoveLiquidity'>

export function RemoveLiquidityConfirmScreen ({ route }: Props): JSX.Element {
  const {
    pair,
    amount, fee,
    tokenAAmount, tokenBAmount
  } = route.params
  const [aSymbol, bSymbol] = pair.symbol.split('-') as [string, string]
  const aToBRate = new BigNumber(pair.tokenB.reserve).div(pair.tokenA.reserve)
  const bToARate = new BigNumber(pair.tokenA.reserve).div(pair.tokenB.reserve)
  const dispatch = useDispatch()
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
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
    if (hasPendingJob) {
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
    <ScrollView style={tailwind('bg-gray-100 pb-4')}>
      <ConfirmTitle
        title={translate('screens/ConfirmRemoveLiquidity', 'YOU ARE REMOVING')}
        testID='text_remove_amount' amount={amount}
        suffix={` ${pair.symbol}`}
      />
      <SectionTitle
        text={translate('screens/ConfirmRemoveLiquidity', 'ESTIMATED AMOUNT TO RECEIVE')}
        testID='title_remove_detail'
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
        text={translate('screens/ConfirmRemoveLiquidity', 'TRANSACTION DETAILS')}
        testID='title_tx_detail'
      />
      <NumberRow
        lhs={translate('screens/ConfirmRemoveLiquidity', 'Price')}
        rightHandElements={[
          { value: aToBRate.toFixed(8), suffix: ` ${bSymbol} per ${aSymbol}`, testID: 'price_a' },
          { value: bToARate.toFixed(8), suffix: ` ${aSymbol} per ${bSymbol}`, testID: 'price_b' }
        ]}
      />
      <NumberRow
        lhs={translate('screens/ConfirmRemoveLiquidity', 'Estimated fee')}
        rightHandElements={[{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }]}
      />
      <SubmitButtonGroup
        onSubmit={onSubmit} onCancel={onCancel} title='remove'
        label={translate('screens/ConfirmRemoveLiquidity', 'REMOVE')}
        isDisabled={isSubmitting || hasPendingJob}
      />
    </ScrollView>
  )
}

async function constructSignedRemoveLiqAndSend (pair: PoolPairData, amount: BigNumber, dispatch: Dispatch<any>, postAction: () => void): Promise<void> {
  const tokenId = Number(pair.id)
  const symbol = pair.symbol
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
    title: `${translate('screens/RemoveLiquidity', 'Removing Liquidity')}`,
    description: `${translate('screens/RemoveLiquidity', `Removing ${amount.toFixed(8)} ${symbol}`)}`,
    postAction
  }))
}
