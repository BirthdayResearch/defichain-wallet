import { CTransactionSegWit, PoolSwap } from '@defichain/jellyfish-transaction/dist'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { NavigationProp, StackActions, useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import React, { Dispatch, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Logging } from '../../../../../api'
import {
  ConfirmTitle,
  NumberRow,
  SubmitButtonGroup,
  TokenBalanceRow
} from '../../../../../components/ConfirmComponents'
import { SectionTitle } from '../../../../../components/SectionTitle'
import { RootState } from '../../../../../store'
import { hasTXinOceanQueue } from '../../../../../store/ocean'
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
  const hasPendingJob = useSelector((state: RootState) => hasTxQueued(state.transactionQueue)) || useSelector((state: RootState) => hasTXinOceanQueue(state.ocean))
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
    if (hasPendingJob) {
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
    <ScrollView style={tailwind('bg-gray-100 pb-4')}>
      <ConfirmTitle
        title={translate('screens/PoolSwapConfirmScreen', 'YOU ARE SWAPPING')}
        testID='text_swap_amount' amount={swap.fromAmount}
        suffix={` ${tokenA.symbol}`}
      />
      <SectionTitle
        text={translate('screens/PoolSwapConfirmScreen', 'ESTIMATED BALANCE AFTER SWAP')}
        testID='title_swap_detail'
      />
      <TokenBalanceRow
        iconType={tokenA.symbol}
        lhs={tokenA.symbol}
        rhs={{
          value: BigNumber.max(new BigNumber(tokenA.amount).minus(swap.fromAmount), 0).toFixed(8),
          testID: 'source_amount'
        }}
      />
      <TokenBalanceRow
        iconType={tokenB.symbol}
        lhs={tokenB.symbol}
        rhs={{
          value: BigNumber.max(new BigNumber(tokenB.amount).plus(swap.toAmount), 0).toFixed(8),
          testID: 'target_amount'
        }}
      />
      <SectionTitle
        text={translate('screens/PoolSwapConfirmScreen', 'TRANSACTION DETAILS')}
        testID='title_tx_detail'
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
        onSubmit={onSubmit} onCancel={onCancel} title='swap'
        label={translate('screens/PoolSwapConfirmScreen', 'SWAP')}
        isDisabled={isSubmitting || hasPendingJob}
      />
    </ScrollView>
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
      title: `${translate('screens/PoolSwapScreen', 'Swapping Token')}`,
      description: `${translate('screens/PoolSwapScreen', `Swapping ${dexForm.fromAmount.toFixed(8)} ${dexForm.fromToken.symbol} to ${dexForm.toAmount.toFixed(8)} ${dexForm.toToken.symbol}`)}`,
      postAction
    }))
  } catch (e) {
    Logging.error(e)
  }
}
