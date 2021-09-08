import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { ThemedTextActivityIndicator } from '@components/themed/ThemedTextActivityIndicator'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import { NumberRow } from '../../../../../components/NumberRow'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { SubmitButtonGroup } from '../../../../../components/SubmitButtonGroup'
import { SummaryTitle } from '../../../../../components/SummaryTitle'
import { ThemedScrollView } from '../../../../../components/themed'
import { TokenBalanceRow } from '../../../../../components/TokenBalanceRow'
import { RootState } from '../../../../../store'
import { hasTxQueued as hasBroadcastQueued } from '../../../../../store/ocean'
import { hasTxQueued, transactionQueue } from '../../../../../store/transaction_queue'
import { tailwind } from '../../../../../tailwind'
import { translate } from '../../../../../translations'
import { DexParamList } from '../DexNavigator'
import { DerivedTokenState } from './PoolSwapScreen'

type Props = StackScreenProps<DexParamList, 'ConfirmPoolSwapScreen'>

export function ConfirmPoolSwapScreen ({ route }: Props): JSX.Element {
  const {
    tokenA,
    tokenB,
    fee,
    swap,
    pair,
    slippage
  } = route.params
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue))
  const hasPendingBroadcastJob = useSelector((state: RootState) => hasBroadcastQueued(state.ocean))
  const dispatch = useDispatch()
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
    await constructSignedSwapAndSend(swap, slippage, dispatch, postAction)
    setIsSubmitting(false)
  }

  function onCancel (): void {
    if (!isSubmitting) {
      navigation.navigate({ name: 'PoolSwap', params: { pair }, merge: true })
    }
  }

  return (
    <ThemedScrollView style={tailwind('pb-4')}>
      <SummaryTitle
        amount={swap.fromAmount}
        suffix={` ${tokenA.displaySymbol}`}
        testID='text_swap_amount'
        title={translate('screens/PoolSwapConfirmScreen', 'YOU ARE SWAPPING')}
      />

      <SectionTitle
        testID='title_swap_detail'
        text={translate('screens/PoolSwapConfirmScreen', 'ESTIMATED BALANCE AFTER SWAP')}
      />

      <TokenBalanceRow
        iconType={tokenA.displaySymbol}
        lhs={tokenA.displaySymbol}
        rhs={{
          value: BigNumber.max(new BigNumber(tokenA.amount).minus(swap.fromAmount), 0).toFixed(8),
          testID: 'source_amount'
        }}
      />

      <TokenBalanceRow
        iconType={tokenB.displaySymbol}
        lhs={tokenB.displaySymbol}
        rhs={{
          value: BigNumber.max(new BigNumber(tokenB.amount).plus(swap.toAmount), 0).toFixed(8),
          testID: 'target_amount'
        }}
      />

      <SectionTitle
        testID='title_tx_detail'
        text={translate('screens/PoolSwapConfirmScreen', 'TRANSACTION DETAILS')}
      />

      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Slippage Tolerance')}
        rightHandElements={[{
          value: new BigNumber(slippage).times(100).toFixed(),
          suffix: '%',
          testID: 'slippage_fee'
        }]}
      />

      <NumberRow
        lhs={translate('screens/PoolSwapConfirmScreen', 'Estimated fee')}
        rightHandElements={[{ value: fee.toFixed(8), suffix: ' DFI (UTXO)', testID: 'text_fee' }]}
      />

      <SubmitButtonGroup
        isDisabled={isSubmitting || hasPendingJob || hasPendingBroadcastJob}
        label={isSubmitting
          ? <ThemedTextActivityIndicator
              message={translate('screens/PoolSwapConfirmScreen', 'Swapping Token')}
              dark={tailwind('text-gray-500 font-bold')}
              light={tailwind('text-gray-400 font-bold')}
            />
          : translate('screens/PoolSwapConfirmScreen', 'SWAP')}
        onCancel={onCancel}
        onSubmit={onSubmit}
        title='swap'
      />
    </ThemedScrollView>
  )
}

export interface DexForm {
  fromToken: DerivedTokenState
  toToken: DerivedTokenState
  fromAmount: BigNumber
  toAmount: BigNumber
}

async function constructSignedSwapAndSend (
  dexForm: DexForm,
  slippage: number,
  dispatch: Dispatch<any>,
  postAction: () => void
): Promise<void> {
  try {
    const maxPrice = dexForm.fromAmount.div(dexForm.toAmount).times(1 + slippage).decimalPlaces(8)
    const signer = async (account: WhaleWalletAccount): Promise<CTransactionSegWit> => {
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
      title: translate('screens/PoolSwapConfirmScreen', 'Swapping Token'),
      description: translate('screens/PoolSwapConfirmScreen', 'Swapping {{amountA}} {{symbolA}} to {{amountB}} {{symbolB}}', {
        amountA: dexForm.fromAmount.toFixed(8),
        symbolA: dexForm.fromToken.displaySymbol,
        amountB: dexForm.toAmount.toFixed(8),
        symbolB: dexForm.toToken.displaySymbol
      }),
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
